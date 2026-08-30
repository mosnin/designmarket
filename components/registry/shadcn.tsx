"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { Command } from "cmdk";
import { OTPInput, type SlotProps } from "input-otp";
import {
  ArrowUpDown, Check, ChevronDown, ChevronsUpDown, Circle,
  Copy, Minus, Search, Trash2, X,
} from "lucide-react";
import { GithubMark } from "@/components/brand/github-mark";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  PvBadge, PvButton, PvCard, PvInput, PvLabel, PvMuted, PvStage,
  bool, num, str,
} from "./kit";
import type { RegistryKey } from "@/lib/registry-manifest";
import type { RegistryEntry } from "./types";

/* Small shared fixtures so previews look like real product UI, not lorem. */
const FRAMEWORKS = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "React Router" },
  { value: "astro", label: "Astro" },
  { value: "vite", label: "Vite" },
  { value: "nuxt", label: "Nuxt" },
];

const ROWS = [
  { id: "1", name: "shadcn/ui", kind: "Library", downloads: "—", score: 100 },
  { id: "2", name: "Radix Primitives", kind: "Primitives", downloads: "73m", score: 87 },
  { id: "3", name: "Recharts", kind: "Charts", downloads: "59m", score: 84 },
  { id: "4", name: "Motion", kind: "Animation", downloads: "19.5m", score: 86 },
  { id: "5", name: "TanStack Table", kind: "Tables", downloads: "19.6m", score: 89 },
  { id: "6", name: "Zustand", kind: "State", downloads: "53.6m", score: 90 },
];

export const shadcnRegistry = {
  "shadcn/button": {
    usage: `<Button variant="default" size="default">
  Install library
</Button>`,
    render: (p) => {
      type Variant = Parameters<typeof PvButton>[0]["variant"];
      type Size = Parameters<typeof PvButton>[0]["size"];
      const variant = str(p, "variant", "default") as Variant;
      const size = str(p, "size", "default") as Size;
      const disabled = bool(p, "disabled", false);
      const iconOnly = size === "icon";
      return (
        <PvStage className="gap-3">
          <PvButton variant={variant} size={size} disabled={disabled}>
            {iconOnly ? <Copy /> : "Install library"}
          </PvButton>
          <PvButton variant={variant} size={size} disabled={disabled}>
            <GithubMark />
            {iconOnly ? null : "GitHub"}
          </PvButton>
        </PvStage>
      );
    },
  },

  "shadcn/badge": {
    usage: `<Badge variant="secondary">RSC-safe</Badge>`,
    render: (p) => {
      const variant = str(p, "variant", "default") as Parameters<
        typeof PvBadge
      >[0]["variant"];
      return (
        <PvStage className="flex-wrap gap-2">
          <PvBadge variant={variant}>MIT</PvBadge>
          <PvBadge variant={variant}>RSC-safe</PvBadge>
          <PvBadge variant={variant}>Tailwind v4</PvBadge>
        </PvStage>
      );
    },
  },

  "shadcn/card": {
    usage: `<Card>
  <CardHeader>
    <CardTitle>Radix Primitives</CardTitle>
    <CardDescription>Unstyled, accessible behaviour</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>`,
    render: (p) => (
      <PvStage>
        <PvCard className="w-full max-w-sm overflow-hidden">
          {bool(p, "withImage", false) ? (
            <div className="h-24 w-full bg-pv-secondary" />
          ) : null}
          <div className="flex flex-col gap-1.5 p-5">
            <h3 className="text-base font-semibold leading-none">Radix Primitives</h3>
            <PvMuted>Unstyled, accessible behaviour for the hard components.</PvMuted>
          </div>
          <div className="px-5 pb-5">
            <div className="flex items-center gap-3 text-[13px] text-pv-muted-foreground">
              <span className="font-mono">73m/wk</span>
              <span className="font-mono">12.3 kB</span>
            </div>
          </div>
          {bool(p, "withFooter", true) ? (
            <div className="flex items-center gap-2 border-t border-pv-border px-5 py-3">
              <PvButton size="sm">Install</PvButton>
              <PvButton size="sm" variant="ghost">
                Docs
              </PvButton>
            </div>
          ) : null}
        </PvCard>
      </PvStage>
    ),
  },

  "shadcn/avatar": {
    usage: `<Avatar>
  <AvatarImage src={user.image} alt="" />
  <AvatarFallback>AL</AvatarFallback>
</Avatar>`,
    render: (p) => {
      const size = { sm: "size-8", default: "size-10", lg: "size-14" }[
        str(p, "size", "default")
      ] ?? "size-10";
      const people = ["AL", "RM", "JS", "KT"];
      const stacked = bool(p, "stack", false);
      return (
        <PvStage className={stacked ? "-space-x-3" : "gap-3"}>
          {people.map((initials) => (
            <AvatarPrimitive.Root
              key={initials}
              className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full border-2 border-pv-background bg-pv-secondary",
                size
              )}
            >
              <AvatarPrimitive.Fallback className="flex size-full items-center justify-center text-xs font-semibold text-pv-secondary-foreground">
                {initials}
              </AvatarPrimitive.Fallback>
            </AvatarPrimitive.Root>
          ))}
        </PvStage>
      );
    },
  },

  "shadcn/dialog": {
    height: 300,
    usage: `<Dialog>
  <DialogTrigger asChild><Button>Add to board</Button></DialogTrigger>
  <DialogContent>…</DialogContent>
</Dialog>`,
    render: (p) => {
      const width = { sm: "max-w-sm", default: "max-w-md", lg: "max-w-lg" }[
        str(p, "size", "default")
      ] ?? "max-w-md";
      return (
        <PvStage>
          <DialogPrimitive.Root>
            <DialogPrimitive.Trigger asChild>
              <PvButton>Add to board</PvButton>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
              <DialogPrimitive.Content
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-pv border border-pv-border bg-pv-popover p-6 text-pv-popover-foreground shadow-xl",
                  width
                )}
              >
                <DialogPrimitive.Title className="text-base font-semibold">
                  Add to a board
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1.5 text-[13px] text-pv-muted-foreground">
                  Focus is trapped here and returns to the trigger on close.
                </DialogPrimitive.Description>
                <div className="mt-4 flex flex-col gap-2">
                  <PvLabel htmlFor="board">Board name</PvLabel>
                  <PvInput id="board" defaultValue="Dashboard rebuild" />
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <DialogPrimitive.Close asChild>
                    <PvButton variant="ghost" size="sm">
                      Cancel
                    </PvButton>
                  </DialogPrimitive.Close>
                  <DialogPrimitive.Close asChild>
                    <PvButton size="sm">Save</PvButton>
                  </DialogPrimitive.Close>
                </div>
                {bool(p, "showClose", true) ? (
                  <DialogPrimitive.Close className="absolute right-4 top-4 text-pv-muted-foreground hover:text-pv-foreground">
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                ) : null}
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        </PvStage>
      );
    },
  },

  "shadcn/tabs": {
    usage: `<Tabs defaultValue="preview">
  <TabsList>
    <TabsTrigger value="preview">Preview</TabsTrigger>
    <TabsTrigger value="code">Code</TabsTrigger>
  </TabsList>
</Tabs>`,
    render: (p) => {
      const vertical = str(p, "orientation", "horizontal") === "vertical";
      const count = Math.max(2, Math.min(5, num(p, "count", 3)));
      const items = ["Preview", "Code", "Props", "A11y", "Deps"].slice(0, count);
      return (
        <PvStage>
          <TabsPrimitive.Root
            defaultValue={items[0]}
            orientation={vertical ? "vertical" : "horizontal"}
            className={cn("w-full max-w-md", vertical && "flex gap-4")}
          >
            <TabsPrimitive.List
              className={cn(
                "inline-flex gap-1 rounded-pv-sm bg-pv-muted p-1",
                vertical ? "flex-col" : "items-center"
              )}
            >
              {items.map((item) => (
                <TabsPrimitive.Trigger
                  key={item}
                  value={item}
                  className="rounded-pv-sm px-3 py-1.5 text-[13px] font-medium text-pv-muted-foreground transition-colors data-[state=active]:bg-pv-background data-[state=active]:text-pv-foreground data-[state=active]:shadow-sm"
                >
                  {item}
                </TabsPrimitive.Trigger>
              ))}
            </TabsPrimitive.List>
            {items.map((item) => (
              <TabsPrimitive.Content key={item} value={item} className="flex-1 pt-3">
                <PvMuted>The {item.toLowerCase()} panel.</PvMuted>
              </TabsPrimitive.Content>
            ))}
          </TabsPrimitive.Root>
        </PvStage>
      );
    },
  },

  "shadcn/select": {
    height: 260,
    usage: `<Select>
  <SelectTrigger><SelectValue placeholder="Framework" /></SelectTrigger>
  <SelectContent>…</SelectContent>
</Select>`,
    render: (p) => (
      <PvStage>
        <SelectPrimitive.Root defaultValue="next" disabled={bool(p, "disabled", false)}>
          <SelectPrimitive.Trigger
            className={cn(
              "inline-flex w-56 items-center justify-between gap-2 rounded-pv-sm border border-pv-input bg-pv-background px-3 text-sm text-pv-foreground disabled:opacity-50",
              str(p, "size", "default") === "sm" ? "h-8" : "h-9"
            )}
          >
            <SelectPrimitive.Value placeholder="Pick a framework" />
            <SelectPrimitive.Icon>
              <ChevronDown className="size-4 opacity-60" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={6}
              className="z-50 min-w-56 overflow-hidden rounded-pv border border-pv-border bg-pv-popover p-1 text-pv-popover-foreground shadow-lg"
            >
              <SelectPrimitive.Viewport>
                {FRAMEWORKS.map((item) => (
                  <SelectPrimitive.Item
                    key={item.value}
                    value={item.value}
                    className="relative flex cursor-pointer select-none items-center rounded-pv-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-pv-muted"
                  >
                    <span className="absolute left-2 flex size-4 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="size-3.5" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{item.label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </PvStage>
    ),
  },

  "shadcn/command": {
    height: 320,
    usage: `<Command>
  <CommandInput placeholder="Type a command…" />
  <CommandList>
    <CommandGroup heading="Components">…</CommandGroup>
  </CommandList>
</Command>`,
    render: (p) => (
      <PvStage>
        <PvCard className="w-full max-w-md overflow-hidden p-0">
          <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-pv-muted-foreground">
            <div className="flex items-center gap-2 border-b border-pv-border px-3">
              <Search className="size-4 shrink-0 text-pv-muted-foreground" />
              <Command.Input
                placeholder={str(p, "placeholder", "Type a command or search…")}
                className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-pv-muted-foreground"
              />
            </div>
            <Command.List className="max-h-56 overflow-y-auto p-1.5">
              <Command.Empty className="py-6 text-center text-[13px] text-pv-muted-foreground">
                Nothing found.
              </Command.Empty>
              {bool(p, "showGroups", true) ? (
                <>
                  <Command.Group heading="Components">
                    {["Date range picker", "Data table", "Command palette"].map((item) => (
                      <Command.Item
                        key={item}
                        className="cursor-pointer rounded-pv-sm px-2.5 py-2 text-[13px] data-[selected=true]:bg-pv-muted"
                      >
                        {item}
                      </Command.Item>
                    ))}
                  </Command.Group>
                  <Command.Group heading="Actions">
                    <Command.Item className="cursor-pointer rounded-pv-sm px-2.5 py-2 text-[13px] data-[selected=true]:bg-pv-muted">
                      Copy install command
                    </Command.Item>
                  </Command.Group>
                </>
              ) : (
                ["Date range picker", "Data table", "Command palette", "Toast"].map(
                  (item) => (
                    <Command.Item
                      key={item}
                      className="cursor-pointer rounded-pv-sm px-2.5 py-2 text-[13px] data-[selected=true]:bg-pv-muted"
                    >
                      {item}
                    </Command.Item>
                  )
                )
              )}
            </Command.List>
          </Command>
        </PvCard>
      </PvStage>
    ),
  },

  "shadcn/combobox": {
    height: 300,
    usage: `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox">{value ?? "Select framework…"}</Button>
  </PopoverTrigger>
  <PopoverContent><Command>…</Command></PopoverContent>
</Popover>`,
    render: (p) => <ComboboxPreview props={p} />,
  },

  "shadcn/toast": {
    height: 220,
    usage: `import { toast } from "sonner";

toast.success("Added to your board", {
  action: { label: "Undo", onClick: () => undo() },
});`,
    render: (p) => <ToastPreview props={p} />,
  },

  "shadcn/form": {
    height: 300,
    usage: `const form = useForm({ resolver: zodResolver(schema) });

<FormField
  control={form.control}
  name="repo"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Repository</FormLabel>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )}
/>`,
    render: (p) => {
      const showError = bool(p, "showError", false);
      const inline = str(p, "layout", "stacked") === "inline";
      return (
        <PvStage>
          <form
            className="w-full max-w-md"
            onSubmit={(event) => event.preventDefault()}
            noValidate
          >
            <div className={cn("flex gap-3", inline ? "items-end" : "flex-col")}>
              <div className="flex flex-1 flex-col gap-1.5">
                <PvLabel htmlFor="repo">Repository URL</PvLabel>
                <PvInput
                  id="repo"
                  defaultValue={showError ? "not-a-url" : "github.com/radix-ui/primitives"}
                  aria-invalid={showError}
                  aria-describedby={showError ? "repo-error" : "repo-hint"}
                  className={showError ? "border-pv-destructive" : ""}
                />
                {showError ? (
                  <p id="repo-error" className="text-[13px] font-medium text-pv-destructive">
                    Enter a GitHub or npm URL we can fetch facts from.
                  </p>
                ) : (
                  <PvMuted id="repo-hint">
                    We read stars, licence and last release from here.
                  </PvMuted>
                )}
              </div>
              <PvButton type="submit" className={inline ? "" : "mt-1 self-start"}>
                Import
              </PvButton>
            </div>
          </form>
        </PvStage>
      );
    },
  },

  "shadcn/data-table": {
    height: 400,
    usage: `const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

<Table>
  <TableHeader>…</TableHeader>
  <TableBody>…</TableBody>
</Table>`,
    render: (p) => <DataTablePreview props={p} />,
  },

  "shadcn/input-otp": {
    height: 200,
    usage: `<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    …
  </InputOTPGroup>
</InputOTP>`,
    render: (p) => {
      const length = Math.max(4, Math.min(8, num(p, "length", 6)));
      const state = str(p, "state", "idle");
      return (
        <PvStage className="flex-col gap-3">
          <OTPInput
            maxLength={length}
            containerClassName="flex items-center gap-2"
            render={({ slots }) => (
              <>
                {slots.map((slot: SlotProps, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "flex h-11 w-9 items-center justify-center rounded-pv-sm border text-base font-medium transition-all",
                      slot.isActive
                        ? "border-pv-ring ring-2 ring-pv-ring/30"
                        : "border-pv-input",
                      state === "error" && "border-pv-destructive",
                      state === "success" && "border-pv-primary"
                    )}
                  >
                    {slot.char ?? (
                      <span className="text-pv-muted-foreground/40">•</span>
                    )}
                  </div>
                ))}
              </>
            )}
          />
          <PvMuted>
            {state === "error"
              ? "That code has expired."
              : "Paste fills every box at once."}
          </PvMuted>
        </PvStage>
      );
    },
  },

  "shadcn/progress": {
    usage: `<Progress value={62} />`,
    render: (p) => {
      const indeterminate = bool(p, "indeterminate", false);
      const value = Math.max(0, Math.min(100, num(p, "value", 62)));
      return (
        <PvStage className="flex-col gap-3">
          <ProgressPrimitive.Root
            value={indeterminate ? null : value}
            className="relative h-2 w-full max-w-sm overflow-hidden rounded-full bg-pv-secondary"
          >
            <ProgressPrimitive.Indicator
              className={cn(
                "size-full bg-pv-primary transition-transform duration-500",
                indeterminate && "animate-pulse"
              )}
              style={{
                transform: `translateX(-${indeterminate ? 60 : 100 - value}%)`,
              }}
            />
          </ProgressPrimitive.Root>
          <PvMuted>{indeterminate ? "Working…" : `${value}% ingested`}</PvMuted>
        </PvStage>
      );
    },
  },

  "shadcn/checkbox": {
    usage: `<Checkbox id="rsc" defaultChecked />
<Label htmlFor="rsc">RSC-safe only</Label>`,
    render: (p) => {
      const state = str(p, "state", "checked");
      const checked =
        state === "indeterminate" ? "indeterminate" : state === "checked";
      return (
        <PvStage className="flex-col items-start gap-3 pl-8">
          {["RSC-safe only", "Ships TypeScript types", "Permissive licence"].map(
            (label, index) => (
              <div key={label} className="flex items-center gap-2.5">
                <CheckboxPrimitive.Root
                  id={`cb-${index}`}
                  defaultChecked={index === 0 ? (checked as boolean) : index === 1}
                  className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-pv-input data-[state=checked]:border-pv-primary data-[state=checked]:bg-pv-primary data-[state=checked]:text-pv-primary-foreground data-[state=indeterminate]:border-pv-primary data-[state=indeterminate]:bg-pv-primary data-[state=indeterminate]:text-pv-primary-foreground"
                >
                  <CheckboxPrimitive.Indicator>
                    {checked === "indeterminate" && index === 0 ? (
                      <Minus className="size-3" strokeWidth={3} />
                    ) : (
                      <Check className="size-3" strokeWidth={3} />
                    )}
                  </CheckboxPrimitive.Indicator>
                </CheckboxPrimitive.Root>
                {bool(p, "withLabel", true) ? (
                  <PvLabel htmlFor={`cb-${index}`} className="cursor-pointer">
                    {label}
                  </PvLabel>
                ) : null}
              </div>
            )
          )}
        </PvStage>
      );
    },
  },

  "shadcn/radio-group": {
    height: 220,
    usage: `<RadioGroup defaultValue="mit">
  <RadioGroupItem value="mit" id="mit" />
  <Label htmlFor="mit">MIT</Label>
</RadioGroup>`,
    render: (p) => {
      const horizontal = str(p, "orientation", "vertical") === "horizontal";
      const asCards = bool(p, "asCards", false);
      const options = [
        { value: "mit", label: "MIT", hint: "Ship it anywhere" },
        { value: "apache", label: "Apache 2.0", hint: "Patent grant included" },
        { value: "gpl", label: "GPL", hint: "Copyleft obligations" },
      ];
      return (
        <PvStage>
          <RadioGroupPrimitive.Root
            defaultValue="mit"
            className={cn("flex gap-3", horizontal ? "flex-row" : "flex-col")}
          >
            {options.map((option) => (
              <label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5",
                  asCards &&
                    "rounded-pv border border-pv-border bg-pv-card p-3 has-[button[data-state=checked]]:border-pv-primary"
                )}
              >
                <RadioGroupPrimitive.Item
                  id={option.value}
                  value={option.value}
                  className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-pv-input data-[state=checked]:border-pv-primary"
                >
                  <RadioGroupPrimitive.Indicator>
                    <Circle className="size-2 fill-pv-primary text-pv-primary" />
                  </RadioGroupPrimitive.Indicator>
                </RadioGroupPrimitive.Item>
                <span>
                  <span className="block text-sm font-medium">{option.label}</span>
                  {asCards ? <PvMuted className="mt-0.5">{option.hint}</PvMuted> : null}
                </span>
              </label>
            ))}
          </RadioGroupPrimitive.Root>
        </PvStage>
      );
    },
  },

  "shadcn/hover-card": {
    height: 260,
    usage: `<HoverCard openDelay={300}>
  <HoverCardTrigger asChild><a href="#">@radix-ui</a></HoverCardTrigger>
  <HoverCardContent>…</HoverCardContent>
</HoverCard>`,
    render: (p) => (
      <PvStage>
        <HoverCardPrimitive.Root openDelay={num(p, "openDelay", 300)} closeDelay={120}>
          <HoverCardPrimitive.Trigger asChild>
            <button className="text-sm font-medium text-pv-primary underline-offset-4 hover:underline">
              @radix-ui/primitives
            </button>
          </HoverCardPrimitive.Trigger>
          <HoverCardPrimitive.Portal>
            <HoverCardPrimitive.Content
              side={str(p, "side", "bottom") as "bottom"}
              sideOffset={8}
              className="z-50 w-64 rounded-pv border border-pv-border bg-pv-popover p-4 text-pv-popover-foreground shadow-lg"
            >
              <p className="text-sm font-semibold">Radix Primitives</p>
              <PvMuted className="mt-1">
                Unstyled, accessible behaviour for the hard components.
              </PvMuted>
              <div className="mt-3 flex gap-3 font-mono text-[11px] text-pv-muted-foreground">
                <span>73m/wk</span>
                <span>MIT</span>
              </div>
            </HoverCardPrimitive.Content>
          </HoverCardPrimitive.Portal>
        </HoverCardPrimitive.Root>
      </PvStage>
    ),
  },

  "shadcn/collapsible": {
    height: 220,
    usage: `<Collapsible>
  <CollapsibleTrigger>Peer dependencies</CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`,
    render: (p) => (
      <PvStage>
        <CollapsiblePrimitive.Root
          defaultOpen={bool(p, "defaultOpen", false)}
          className="w-full max-w-sm"
        >
          <CollapsiblePrimitive.Trigger className="group flex w-full items-center justify-between rounded-pv-sm border border-pv-border bg-pv-card px-3 py-2 text-sm font-medium">
            Peer dependencies
            <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsiblePrimitive.Trigger>
          <CollapsiblePrimitive.Content className="overflow-hidden">
            <ul className="mt-2 flex flex-col gap-1 rounded-pv-sm border border-pv-border bg-pv-muted p-3 font-mono text-[12px] text-pv-muted-foreground">
              <li>react ^19.0.0</li>
              <li>react-dom ^19.0.0</li>
            </ul>
          </CollapsiblePrimitive.Content>
        </CollapsiblePrimitive.Root>
      </PvStage>
    ),
  },

  "shadcn/context-menu": {
    height: 240,
    usage: `<ContextMenu>
  <ContextMenuTrigger>Right click a card</ContextMenuTrigger>
  <ContextMenuContent>…</ContextMenuContent>
</ContextMenu>`,
    render: (p) => (
      <PvStage>
        <ContextMenuPrimitive.Root>
          <ContextMenuPrimitive.Trigger className="flex h-28 w-full max-w-sm items-center justify-center rounded-pv border border-dashed border-pv-border text-[13px] text-pv-muted-foreground">
            Right click here
          </ContextMenuPrimitive.Trigger>
          <ContextMenuPrimitive.Portal>
            <ContextMenuPrimitive.Content className="z-50 min-w-48 rounded-pv border border-pv-border bg-pv-popover p-1 text-pv-popover-foreground shadow-lg">
              {["Open in new tab", "Copy install command", "Add to board"].map((item) => (
                <ContextMenuPrimitive.Item
                  key={item}
                  className="cursor-pointer rounded-pv-sm px-2 py-1.5 text-[13px] outline-none data-[highlighted]:bg-pv-muted"
                >
                  {item}
                </ContextMenuPrimitive.Item>
              ))}
              {bool(p, "withSubmenu", true) ? (
                <ContextMenuPrimitive.Sub>
                  <ContextMenuPrimitive.SubTrigger className="flex cursor-pointer items-center justify-between rounded-pv-sm px-2 py-1.5 text-[13px] outline-none data-[highlighted]:bg-pv-muted">
                    Compare with
                    <ChevronDown className="size-3.5 -rotate-90" />
                  </ContextMenuPrimitive.SubTrigger>
                  <ContextMenuPrimitive.Portal>
                    <ContextMenuPrimitive.SubContent className="z-50 min-w-40 rounded-pv border border-pv-border bg-pv-popover p-1 shadow-lg">
                      {["Base UI", "Ark UI", "React Aria"].map((item) => (
                        <ContextMenuPrimitive.Item
                          key={item}
                          className="cursor-pointer rounded-pv-sm px-2 py-1.5 text-[13px] outline-none data-[highlighted]:bg-pv-muted"
                        >
                          {item}
                        </ContextMenuPrimitive.Item>
                      ))}
                    </ContextMenuPrimitive.SubContent>
                  </ContextMenuPrimitive.Portal>
                </ContextMenuPrimitive.Sub>
              ) : null}
              <ContextMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-pv-border" />
              <ContextMenuPrimitive.Item className="flex cursor-pointer items-center gap-2 rounded-pv-sm px-2 py-1.5 text-[13px] text-pv-destructive outline-none data-[highlighted]:bg-pv-destructive/10">
                <Trash2 className="size-3.5" />
                Remove
              </ContextMenuPrimitive.Item>
            </ContextMenuPrimitive.Content>
          </ContextMenuPrimitive.Portal>
        </ContextMenuPrimitive.Root>
      </PvStage>
    ),
  },

  "shadcn/toggle-group": {
    usage: `<ToggleGroup type="single" defaultValue="grid">
  <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
  <ToggleGroupItem value="list">List</ToggleGroupItem>
</ToggleGroup>`,
    render: (p) => {
      const multiple = str(p, "type", "single") === "multiple";
      const small = str(p, "size", "default") === "sm";
      const items = ["Grid", "List", "Compare"];
      const itemClass = cn(
        "inline-flex items-center justify-center rounded-pv-sm font-medium text-pv-muted-foreground transition-colors data-[state=on]:bg-pv-background data-[state=on]:text-pv-foreground data-[state=on]:shadow-sm",
        small ? "h-7 px-2.5 text-[12px]" : "h-8 px-3 text-[13px]"
      );
      return (
        <PvStage>
          {multiple ? (
            <ToggleGroupPrimitive.Root
              type="multiple"
              defaultValue={["Grid"]}
              className="inline-flex gap-1 rounded-pv-sm bg-pv-muted p-1"
            >
              {items.map((item) => (
                <ToggleGroupPrimitive.Item key={item} value={item} className={itemClass}>
                  {item}
                </ToggleGroupPrimitive.Item>
              ))}
            </ToggleGroupPrimitive.Root>
          ) : (
            <ToggleGroupPrimitive.Root
              type="single"
              defaultValue="Grid"
              className="inline-flex gap-1 rounded-pv-sm bg-pv-muted p-1"
            >
              {items.map((item) => (
                <ToggleGroupPrimitive.Item key={item} value={item} className={itemClass}>
                  {item}
                </ToggleGroupPrimitive.Item>
              ))}
            </ToggleGroupPrimitive.Root>
          )}
        </PvStage>
      );
    },
  },
} satisfies Partial<Record<RegistryKey, RegistryEntry>>;

/* ---------------------------------------------------------------- helpers */

function ComboboxPreview({ props }: { props: Record<string, unknown> }): ReactNode {
  const multiple = bool(props, "multiple", false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(["next"]);

  const label = selected.length
    ? FRAMEWORKS.filter((f) => selected.includes(f.value))
        .map((f) => f.label)
        .join(", ")
    : str(props, "placeholder", "Select framework…");

  return (
    <PvStage>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <PvButton variant="outline" role="combobox" aria-expanded={open} className="w-56 justify-between">
            <span className="truncate">{label}</span>
            <ChevronsUpDown className="opacity-50" />
          </PvButton>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={6}
            className="z-50 w-56 overflow-hidden rounded-pv border border-pv-border bg-pv-popover p-0 text-pv-popover-foreground shadow-lg"
          >
            <Command>
              <div className="flex items-center gap-2 border-b border-pv-border px-3">
                <Search className="size-3.5 text-pv-muted-foreground" />
                <Command.Input
                  placeholder="Search…"
                  className="h-9 flex-1 bg-transparent text-[13px] outline-none placeholder:text-pv-muted-foreground"
                />
              </div>
              <Command.List className="max-h-48 overflow-y-auto p-1">
                <Command.Empty className="py-4 text-center text-[13px] text-pv-muted-foreground">
                  No framework found.
                </Command.Empty>
                {FRAMEWORKS.map((item) => (
                  <Command.Item
                    key={item.value}
                    value={item.label}
                    onSelect={() => {
                      setSelected((current) =>
                        multiple
                          ? current.includes(item.value)
                            ? current.filter((v) => v !== item.value)
                            : [...current, item.value]
                          : [item.value]
                      );
                      if (!multiple) setOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-pv-sm px-2 py-1.5 text-[13px] data-[selected=true]:bg-pv-muted"
                  >
                    <Check
                      className={cn(
                        "size-3.5",
                        selected.includes(item.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </PvStage>
  );
}

function ToastPreview({ props }: { props: Record<string, unknown> }): ReactNode {
  const variant = str(props, "variant", "success");
  const withAction = bool(props, "withAction", true);
  const [toasts, setToasts] = useState<number[]>([0]);

  const tone = {
    default: "border-pv-border",
    success: "border-pv-primary/40",
    error: "border-pv-destructive/40",
    warning: "border-pv-border",
  }[variant] ?? "border-pv-border";

  const message = {
    default: "Added to your board",
    success: "Added to your board",
    error: "Could not reach the npm registry",
    warning: "This licence is copyleft",
  }[variant] ?? "Added to your board";

  return (
    <PvStage className="flex-col gap-4">
      <PvButton onClick={() => setToasts((t) => [...t.slice(-2), Date.now()])}>
        Show toast
      </PvButton>
      <div className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((id) => (
          <div
            key={id}
            role="status"
            className={cn(
              "flex items-center gap-3 rounded-pv border bg-pv-popover px-3.5 py-3 text-pv-popover-foreground shadow-lg",
              tone
            )}
          >
            <span className="min-w-0 flex-1 text-[13px] font-medium">{message}</span>
            {withAction ? (
              <button
                onClick={() => setToasts((t) => t.filter((x) => x !== id))}
                className="shrink-0 text-[13px] font-medium text-pv-primary hover:underline"
              >
                Undo
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </PvStage>
  );
}

function DataTablePreview({ props }: { props: Record<string, unknown> }): ReactNode {
  const rowCount = Math.max(2, Math.min(ROWS.length, num(props, "rows", 6)));
  const selectable = bool(props, "selectable", true);
  const compact = str(props, "density", "comfortable") === "compact";
  const [sortDesc, setSortDesc] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  const rows = [...ROWS]
    .slice(0, rowCount)
    .sort((a, b) => (sortDesc ? b.score - a.score : a.score - b.score));

  const cell = compact ? "px-3 py-1.5" : "px-3 py-2.5";

  return (
    <div className="w-full">
      <PvCard className="overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-pv-border bg-pv-muted/50">
            <tr>
              {selectable ? (
                <th scope="col" className={cn(cell, "w-9")}>
                  <CheckboxPrimitive.Root
                    checked={selected.length === rows.length && rows.length > 0}
                    onCheckedChange={(value) =>
                      setSelected(value ? rows.map((r) => r.id) : [])
                    }
                    aria-label="Select all rows"
                    className="flex size-4 items-center justify-center rounded-[4px] border border-pv-input data-[state=checked]:border-pv-primary data-[state=checked]:bg-pv-primary data-[state=checked]:text-pv-primary-foreground"
                  >
                    <CheckboxPrimitive.Indicator>
                      <Check className="size-3" strokeWidth={3} />
                    </CheckboxPrimitive.Indicator>
                  </CheckboxPrimitive.Root>
                </th>
              ) : null}
              <th scope="col" className={cn(cell, "font-medium")}>
                Name
              </th>
              <th scope="col" className={cn(cell, "font-medium")}>
                Kind
              </th>
              <th scope="col" className={cn(cell, "font-medium")}>
                Weekly
              </th>
              <th
                scope="col"
                aria-sort={sortDesc ? "descending" : "ascending"}
                className={cn(cell, "font-medium")}
              >
                <button
                  onClick={() => setSortDesc((s) => !s)}
                  className="inline-flex items-center gap-1 hover:text-pv-primary"
                >
                  Score
                  <ArrowUpDown className="size-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-pv-border last:border-0 hover:bg-pv-muted/40"
              >
                {selectable ? (
                  <td className={cell}>
                    <CheckboxPrimitive.Root
                      checked={selected.includes(row.id)}
                      onCheckedChange={(value) =>
                        setSelected((current) =>
                          value
                            ? [...current, row.id]
                            : current.filter((id) => id !== row.id)
                        )
                      }
                      aria-label={`Select ${row.name}`}
                      className="flex size-4 items-center justify-center rounded-[4px] border border-pv-input data-[state=checked]:border-pv-primary data-[state=checked]:bg-pv-primary data-[state=checked]:text-pv-primary-foreground"
                    >
                      <CheckboxPrimitive.Indicator>
                        <Check className="size-3" strokeWidth={3} />
                      </CheckboxPrimitive.Indicator>
                    </CheckboxPrimitive.Root>
                  </td>
                ) : null}
                <td className={cn(cell, "font-medium")}>{row.name}</td>
                <td className={cn(cell, "text-pv-muted-foreground")}>{row.kind}</td>
                <td className={cn(cell, "font-mono text-pv-muted-foreground")}>
                  {row.downloads}
                </td>
                <td className={cn(cell, "font-mono")}>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PvCard>
      <div className="mt-2 flex items-center justify-between text-[12px] text-pv-muted-foreground">
        <span>
          {selected.length} of {rows.length} selected
        </span>
        <div className="flex gap-1.5">
          <PvButton size="sm" variant="outline" disabled>
            Previous
          </PvButton>
          <PvButton size="sm" variant="outline">
            Next
          </PvButton>
        </div>
      </div>
    </div>
  );
}
