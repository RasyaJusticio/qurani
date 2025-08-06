import AppWrapper from "@/components/layouts/app-wrapper";
import InfoHeader from "@/components/layouts/InfoHeader";
import { Head, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react";

interface Chapter {
    id : number,
    name_simple : string
}

interface PageProps {
    chapter: Chapter,
    id_id: {
        text: string
    }
    en_us: {
        text: string
    }
    [key: string]: unknown;
}
export default function InfoChapter() {
    const { chapter, id_id, en_us } = usePage<PageProps>().props;
    const [locale, setLocale] = useState<string>("en_US");

    useEffect(() => {
        const dataLocale = localStorage.getItem("locale") || "en_US";
        setLocale(dataLocale)
    }, [])

    function validateLocale() {
        switch (locale) {
            case "en_US":
                return en_us.text
            case "id_ID":
                return id_id.text
            default:
                return en_us
        }
    }


    validateLocale()

    return (
        <AppWrapper>
            <Head title="info" />
            <InfoHeader chapter={chapter} />
            <div
                className="pt-[100px] px-7 dark:text-white"
                dangerouslySetInnerHTML={{ __html: validateLocale() }}
            />

        </AppWrapper>
    )
}
