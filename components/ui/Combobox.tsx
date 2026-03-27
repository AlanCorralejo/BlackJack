"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn, normalizeText } from "@/lib/utils"
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
import { SelectItemData } from "@/lib/models/common-models"

interface ComboBoxProps {
  data: SelectItemData[],
  currentSelected?: any | null | undefined,
  selectMessage?: string,
  emptyMessage?: string,
  placeholderMessage?: string,
  onSelect: (selectedValue: any) => void,
  disabled?: boolean,
  className?: string,
  disableInactiveItems?: boolean
  returnObject?: boolean,
  showInactives?: boolean,
  sort?: boolean
  deselect?: boolean
  stayOpenOnSelect?: boolean;
}


export function ComboBox({ disabled, data, currentSelected, selectMessage, placeholderMessage, onSelect, className, returnObject = false, showInactives = false, sort = true, deselect = true, stayOpenOnSelect = false }: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [labelText, setLabelText] = React.useState("");
  if (sort) data = data.sort((o1, o2) => { return o1.label < o2.label ? -1 : 1 });
  
  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between truncate border border-primary! text-primary rounded-full", !currentSelected && "text-muted-foreground", className)}
          disabled={data.length === 0 || disabled}
        >
          {
            currentSelected === '' || currentSelected === 0
              ? selectMessage
              : typeof currentSelected === 'number'
                ? data.find(_ => _.value === currentSelected)?.label
                : currentSelected
          }

          {/* {currentSelected
            ? data.find((_) => _.value === Number(currentSelected))?.label
            : (labelText === "Todas" || labelText === "Todos") ? labelText : selectMessage} */}
          <ChevronsUpDown className="ml-2 text-primary h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('p-0 w-(--radix-popover-trigger-width) min-w-50')}>
        <Command
          filter={(value, search) => {
            const normalizedValue = normalizeText(value);
            const normalizedSearch = normalizeText(search);
            return normalizedValue.includes(normalizedSearch) ? 1 : 0;
          }}>
          <CommandInput placeholder={placeholderMessage} />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {data.map((item: SelectItemData) => {
                return (
                  (!showInactives ? item.isEnable : true) &&
                  <CommandItem
                    key={item.value}
                    value={`${item.value}-${item.label}`}
                    disabled={!item.isEnable}
                    onSelect={(currentLabel) => {
                      const isSameValue = item.value === currentSelected;
                      if (isSameValue && !deselect) return;
                      setLabelText(isSameValue ? "" : currentLabel);
                      const returnData = isSameValue
                        ? returnObject ? null : 0
                        : returnObject ? item : item.value;
                      setOpen(stayOpenOnSelect);
                      onSelect(returnData);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentSelected === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
