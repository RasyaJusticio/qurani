import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
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
    className?: string; // Pastikan className bisa di-custom
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
          className={cn(
            "w-[200px] justify-between", // Default width, bisa di-override
            "rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white",
            className // Tambahkan className dari props untuk custom styling
          )}
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
                  value={`${option.value} ${option.label}`}
                  onSelect={(currentValue) => {
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