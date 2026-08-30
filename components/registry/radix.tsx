"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Check, ChevronDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PvButton, PvLabel, PvMuted, PvStage, bool, num, str } from "./kit";
import type { RegistryKey } from "@/lib/registry-manifest";
import type { RegistryEntry } from "./types";

const FAQ = [
  {
    q: "Is this the real package?",
    a: "Yes. The behaviour you are interacting with comes from the actual npm package, vendored into the preview sandbox.",
  },
  {
    q: "Why does it look like this?",
    a: "The skin is ours, painted with the tokens from Theme Morph. The behaviour is the library's.",
  },
  {
    q: "Can I change the props?",
    a: "The playground beside the preview edits them live, and the URL keeps your settings.",
  },
];

export const radixRegistry = {
  "radix/tooltip": {
    height: 200,
    usage: `<Tooltip.Provider delayDuration={200}>
  <Tooltip.Root>
    <Tooltip.Trigger asChild><Button>Bundle size</Button></Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content side="top">12.3 kB min+gzip</Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>`,
    render: (p) => (
      <TooltipPrimitive.Provider delayDuration={num(p, "delayDuration", 200)}>
        <PvStage className="gap-3">
          {["Bundle size", "Licence", "Last release"].map((label) => (
            <TooltipPrimitive.Root key={label}>
              <TooltipPrimitive.Trigger asChild>
                <PvButton variant="outline" size="sm">
                  {label}
                </PvButton>
              </TooltipPrimitive.Trigger>
              <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                  side={str(p, "side", "top") as "top"}
                  sideOffset={6}
                  className="z-50 rounded-pv-sm border border-pv-border bg-pv-popover px-2.5 py-1.5 text-xs text-pv-popover-foreground shadow-md"
                >
                  {label === "Bundle size"
                    ? "12.3 kB min+gzip"
                    : label === "Licence"
                      ? "MIT — ship it anywhere"
                      : "Released 6 days ago"}
                  <TooltipPrimitive.Arrow className="fill-pv-popover" />
                </TooltipPrimitive.Content>
              </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
          ))}
        </PvStage>
      </TooltipPrimitive.Provider>
    ),
  },

  "radix/accordion": {
    height: 300,
    usage: `<Accordion type="single" collapsible>
  <AccordionItem value="a">
    <AccordionTrigger>Is this the real package?</AccordionTrigger>
    <AccordionContent>Yes.</AccordionContent>
  </AccordionItem>
</Accordion>`,
    render: (p) => {
      const multiple = str(p, "type", "single") === "multiple";
      const items = FAQ.map((item, index) => (
        <AccordionPrimitive.Item
          key={item.q}
          value={`item-${index}`}
          className="border-b border-pv-border"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between py-3 text-left text-[14px] font-medium">
              {item.q}
              <ChevronDown className="size-4 shrink-0 text-pv-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden">
            <p className="pb-3 text-[13px] leading-relaxed text-pv-muted-foreground">
              {item.a}
            </p>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ));

      return (
        <PvStage>
          {multiple ? (
            <AccordionPrimitive.Root
              type="multiple"
              defaultValue={["item-0"]}
              className="w-full max-w-md"
            >
              {items}
            </AccordionPrimitive.Root>
          ) : (
            <AccordionPrimitive.Root
              type="single"
              collapsible={bool(p, "collapsible", true)}
              defaultValue="item-0"
              className="w-full max-w-md"
            >
              {items}
            </AccordionPrimitive.Root>
          )}
        </PvStage>
      );
    },
  },

  "radix/dropdown": {
    height: 260,
    usage: `<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="outline">Sort</Button></DropdownMenuTrigger>
  <DropdownMenuContent align="start">…</DropdownMenuContent>
</DropdownMenu>`,
    render: (p) => (
      <PvStage>
        <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger asChild>
            <PvButton variant="outline">
              <MoreHorizontal />
              Sort and filter
            </PvButton>
          </DropdownMenuPrimitive.Trigger>
          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              align={str(p, "align", "start") as "start"}
              sideOffset={6}
              className="z-50 min-w-52 rounded-pv border border-pv-border bg-pv-popover p-1 text-pv-popover-foreground shadow-lg"
            >
              <DropdownMenuPrimitive.Label className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-pv-muted-foreground">
                Sort by
              </DropdownMenuPrimitive.Label>
              {["Ship Score", "Downloads", "Recently shipped"].map((item) => (
                <DropdownMenuPrimitive.Item
                  key={item}
                  className="cursor-pointer rounded-pv-sm px-2 py-1.5 text-[13px] outline-none data-[highlighted]:bg-pv-muted"
                >
                  {item}
                </DropdownMenuPrimitive.Item>
              ))}
              {bool(p, "withCheckboxes", true) ? (
                <>
                  <DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-pv-border" />
                  <DropdownMenuPrimitive.Label className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-pv-muted-foreground">
                    Only show
                  </DropdownMenuPrimitive.Label>
                  {["RSC-safe", "Ships types", "Permissive licence"].map((item, i) => (
                    <DropdownMenuPrimitive.CheckboxItem
                      key={item}
                      defaultChecked={i === 0}
                      className="relative flex cursor-pointer select-none items-center rounded-pv-sm py-1.5 pl-8 pr-2 text-[13px] outline-none data-[highlighted]:bg-pv-muted"
                    >
                      <span className="absolute left-2 flex size-4 items-center justify-center">
                        <DropdownMenuPrimitive.ItemIndicator>
                          <Check className="size-3.5" />
                        </DropdownMenuPrimitive.ItemIndicator>
                      </span>
                      {item}
                    </DropdownMenuPrimitive.CheckboxItem>
                  ))}
                </>
              ) : null}
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </PvStage>
    ),
  },

  "radix/slider": {
    usage: `<Slider defaultValue={[40]} max={100} step={1} />`,
    render: (p) => <SliderPreview props={p} />,
  },

  "radix/switch": {
    usage: `<Switch id="rsc" defaultChecked />
<Label htmlFor="rsc">RSC-safe only</Label>`,
    render: (p) => (
      <PvStage className="flex-col items-start gap-3 pl-6">
        {["Only show live previews", "RSC-safe only", "Hide GPL"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <SwitchPrimitive.Root
              id={`sw-${i}`}
              defaultChecked={i === 0 ? bool(p, "checked", true) : i === 1}
              disabled={i === 0 ? bool(p, "disabled", false) : false}
              className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-pv-primary data-[state=unchecked]:bg-pv-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SwitchPrimitive.Thumb
                className={cn(
                  "pointer-events-none block size-4 rounded-full bg-pv-background shadow-sm transition-transform",
                  "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
                )}
              />
            </SwitchPrimitive.Root>
            <PvLabel htmlFor={`sw-${i}`} className="cursor-pointer">
              {label}
            </PvLabel>
          </div>
        ))}
      </PvStage>
    ),
  },
} satisfies Partial<Record<RegistryKey, RegistryEntry>>;

function SliderPreview({ props }: { props: Record<string, unknown> }): React.ReactNode {
  const range = bool(props, "range", false);
  const step = Math.max(1, num(props, "step", 1));
  const [value, setValue] = useState<number[]>(range ? [12, 64] : [40]);

  return (
    <PvStage className="flex-col gap-3">
      <SliderPrimitive.Root
        value={value}
        onValueChange={setValue}
        max={200}
        step={step}
        minStepsBetweenThumbs={range ? 1 : 0}
        className="relative flex w-full max-w-sm touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-pv-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-pv-primary" />
        </SliderPrimitive.Track>
        {value.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="block size-4 rounded-full border-2 border-pv-primary bg-pv-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pv-ring/40"
          />
        ))}
      </SliderPrimitive.Root>
      <PvMuted className="font-mono">
        {range
          ? `${value[0]} – ${value[1]} kB bundle budget`
          : `Max ${value[0]} kB min+gzip`}
      </PvMuted>
    </PvStage>
  );
}
