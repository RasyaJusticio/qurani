<?php

namespace App\Http\Controllers\LinkID;

use App\Http\Controllers\Controller;
use App\Models\LinkID\Kota;
use App\Models\LinkID\QuSetoranRekap;
use App\Models\LinkID\QuSetoran;
use App\Models\LinkID\User;
use App\Models\Qurani\Chapter;
use App\Models\Qurani\Juz;
use App\Models\Qurani\Verses;
use App\Traits\ErrorLabel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ResultController extends Controller
{
    use ErrorLabel;
    public function index()
    {
        $user = Auth::user();
        $errorLabels = $this->ErrorLabelGenerate($user);
        return Inertia::render('result/Index', [
            'user_id' => $user->user_id,
            "errorLabels" => $errorLabels
        ]);
    }

    public function juz($id)
    {
        $user = Auth::user();
        $errorLabels = $this->ErrorLabelGenerate($user);
        $labels = [];
        $juz = Juz::where("juz_number", $id)->first()->verse_mapping;
        $id_surah = array_keys($juz);
        foreach ($id_surah as $id) {
            $surah = Chapter::where("id", $id)->first();
            $labels["surah"][] = [
                "value" => $surah->id,
                "label" => $surah->name_simple . " " . "(" . $surah->id . ")",
            ];
            $ayat = explode("-", $juz[$id]);
            $awalAyat = $ayat[0];
            $akhirAyat = $ayat[1];
            for ($i = $awalAyat; $i <= $akhirAyat; $i++) {
                $labels["ayat"][$id][] = [
                    "value" => $i,
                    "label" => $i
                ];
            }
        }
        return Inertia::render('result/ResultPageJuz', ["labels" => $labels, 'user_id' => $user->user_id, "errorLabels" => $errorLabels]);
    }

    public function page($id)
    {
        $user = Auth::user();
        $errorLabels = $this->ErrorLabelGenerate($user);
        $labels = [];
        $keyChapter = [];
        // $verses = Verses::where("page_number", $id)->get();
        $chapters = Chapter::get();
        $validChapter = [];
        foreach ($chapters as $value) {
            $halaman = json_decode($value->pages, false);
            $awalHalaman = $halaman[0];
            $akhirHalmaan = $halaman[1];
            if ($id >= $awalHalaman && $id <= $akhirHalmaan) {
                $validChapter[] = $value->id;
                $labels["surah"][] = [
                    "value" => $value->id,
                    "label" => $value->name_simple . "" . "(" . $value->id . ")",
                ];
            }
        }

        foreach ($validChapter as $chapter_id) {
            $verse = Verses::where(function ($query) use ($chapter_id) {
                $query->orWhere('verse_key', 'like', $chapter_id . ':%');
            })->where("page_number", $id)->get();

            foreach ($verse as $value) {
                $labels["ayat"][$chapter_id][] = [
                    "value" => $value->verse_number,
                    "label" => $value->verse_number
                ];
            }
        }
        Log::info($labels);
        // foreach ($verses as $key => $value) {
        //     $chapter = Chapter::where("id", $value->chapter_id)->first();
        //     if(isset($keyChapter[$chapter]))
        // }
        return Inertia::render('result/ResultPageHalaman', ["labels" => $labels, 'user_id' => $user->user_id,"errorLabels" => $errorLabels]);
    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'penyetor' => 'required|string',
            'penerima' => 'required|integer',
            'setoran' => 'required|in:tahsin,tahfidz',
            'tampilan' => 'required|in:surah,juz,page',
            'nomor' => 'required|integer|min:1',
            'info' => 'required|string|max:20',
            'hasil' => 'required|in:Excellent,Very Good,Good,Pass,Weak,Not Pass',
            'ket' => 'nullable|string|max:100',
            'kesalahan' => 'nullable|array',
            'perhalaman' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $penyetor = User::where('user_name', $request->penyetor)->firstOrFail();
            $penerima = $request->penerima;

            $timestamp = Carbon::now()->setTimezone('Asia/Jakarta');

            $setoranData = [
                'tgl' => $timestamp,
                'penyetor' => $penyetor->user_id,
                'penerima' => $penerima,
                'setoran' => $request->setoran,
                'tampilan' => $request->tampilan,
                'nomor' => $request->nomor,
                'info' => $request->info,
                'hasil' => $request->hasil,
                'ket' => $request->ket,
                'kesalahan' => $request->kesalahan ? $request->kesalahan : null,
                'perhalaman' => $request->perhalaman,
                'paraf' => 0,
                'paraftgl' => null,
                'parafoleh' => null,
            ];

            $setoran = QuSetoran::create($setoranData);

            $kota = Kota::find($penyetor->user_city);

            if (!$kota) {
                throw new \Exception('Kota tidak ditemukan untuk penyetor ini.');
            }

            $periode = $timestamp->format('Y-m');
            $day = $timestamp->day;
            $columnDay = 't' . $day;

            $rekap = QuSetoranRekap::where('periode', $periode)
                ->where('kota', $kota->nama)
                ->first();

            if ($rekap) {
                $rekap->$columnDay = ($rekap->$columnDay ?? 0) + 1;
                $rekap->save();
            } else {
                $rekapData = [
                    'periode' => $periode,
                    'negara' => $kota->negara ?? 'Indonesia',
                    'provinsi' => $kota->provinsi ?? null,
                    'kota' => $kota->nama,
                    'lat' => $kota->lat ?? null,
                    'long' => $kota->long ?? null,
                    $columnDay => 1,
                ];

                for ($i = 1; $i <= 31; $i++) {
                    $rekapData['t' . $i] = $rekapData['t' . $i] ?? 0;
                }
                QuSetoranRekap::create($rekapData);
            }

            return response()->json([
                'message' => 'Rekapan setoran berhasil disimpan',
                'data' => [
                    'id' => $setoran->id,
                    'tgl' => $setoran->tgl->toIso8601String(),
                    'penyetor' => $request->penyetor,
                    'penerima' => $request->penerima,
                    'hasil' => $setoran->hasil,
                    'kota' => $kota->nama,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Gagal menyimpan rekapan setoran: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal menyimpan rekapan setoran',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
