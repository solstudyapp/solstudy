
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

// Explicitly define icon type
type IconType = (props: any) => JSX.Element;

// Create a cleaner list of icons by filtering out non-icon exports
const iconList = Object.entries(LucideIcons)
  .filter(([name, component]) => {
    // Only include actual icon components (all icons should be React components)
    return (
      typeof component === 'function' &&
      // Exclude utility functions and non-icon exports
      name !== 'createLucideIcon' &&
      name !== 'icons' &&
      name !== 'default' &&
      name !== 'Icon' &&
      name !== 'createIcons' &&
      name !== 'replaceElement' &&
      name !== 'toKebabCase' &&
      !name.startsWith('__') &&
      name !== 'LucideIcon' &&
      name !== 'LucideProps'
    );
  })
  .map(([name, Icon]) => ({
    name,
    icon: Icon as IconType, // Cast to our IconType
  }));

interface IconSelectorProps {
  selectedIcon: React.ReactNode;
  onSelectIcon: (icon: React.ReactNode, iconName: string) => void;
}

const IconSelector = ({ selectedIcon, onSelectIcon }: IconSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Get current icon name from the selected icon if possible
  const getSelectedIconName = () => {
    if (!selectedIcon) return "";
    
    // Try to match the icon component with one in our list
    for (const { name, icon } of iconList) {
      if (React.isValidElement(selectedIcon) && 
          selectedIcon.type === icon) {
        return name;
      }
    }
    return "";
  };

  const currentIconName = getSelectedIconName();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white/10 border-white/20 text-white h-10"
        >
          <div className="flex items-center gap-2">
            {selectedIcon ? (
              <>
                <div className="w-5 h-5">{selectedIcon}</div>
                <span>{currentIconName}</span>
              </>
            ) : (
              <span>Select an icon</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-black/90 backdrop-blur-md border-white/10 text-white">
        <Command className="bg-transparent">
          <CommandInput 
            placeholder="Search icons..." 
            className="text-white" 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty className="py-2 text-center text-white/60">No icons found.</CommandEmpty>
          <ScrollArea className="h-[300px]">
            <CommandGroup>
              {iconList
                .filter(({ name }) => 
                  name.toLowerCase().includes(searchValue.toLowerCase())
                )
                .map(({ name, icon: IconComponent }) => {
                  const isSelected = name === currentIconName;
                  
                  return (
                    <CommandItem
                      key={name}
                      value={name}
                      onSelect={() => {
                        // Create the icon as a JSX element directly instead of using createElement
                        const iconElement = <IconComponent size={24} />;
                        onSelectIcon(iconElement, name);
                        setOpen(false);
                      }}
                      className={cn(
                        "text-white hover:bg-white/10",
                        isSelected && "bg-white/20"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <IconComponent size={20} />
                        </div>
                        <span>{name}</span>
                      </div>
                      
                      {isSelected && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default IconSelector;
