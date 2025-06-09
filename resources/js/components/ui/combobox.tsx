import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    notFoundText?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className:string;
}

const Combobox: React.FC<ComboboxProps> = ({
    options,
    placeholder = "Select option...",
    searchPlaceholder = "Search option...",
    notFoundText = "No option found.",
    value: externalValue,
    onValueChange,
    className
}) => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(externalValue || "")

  // Update internal state when external value changes
  React.useEffect(() => {
    setValue(externalValue || "")
  }, [externalValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="custom"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{notFoundText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  // PERUBAHAN UTAMA: Gabungkan value dan label untuk filtering
                  value={`${option.value} ${option.label}`}
                  onSelect={(currentValue) => {
                    // Ambil value asli dari option yang dipilih
                    const selectedOption = options.find(opt =>
                      `${opt.value} ${opt.label}`.toLowerCase() === currentValue.toLowerCase()
                    );
                    const actualValue = selectedOption?.value || "";
                    const newValue = actualValue === value ? "" : actualValue;
                    setValue(newValue);
                    onValueChange?.(newValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default Combobox
