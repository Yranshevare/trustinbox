'use client';

import * as React from 'react';
import { cn } from './utils';
import { useIsMobile } from './hooks/use-mobile';
import {
  Popover,
  PopoverHeader,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  PopoverFooter,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from './popover';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerBody,
  DrawerClose,
} from './drawer';

const ResponsivePopoverContext = React.createContext<{
  isMobile: boolean;
} | null>(null);

function useResponsivePopoverContext() {
  const context = React.useContext(ResponsivePopoverContext);
  if (!context) {
    throw new Error(
      'ResponsivePopoverTrigger or ResponsivePopoverContent must be used within <ResponsivePopover>',
    );
  }
  return context;
}

type ResponsivePopoverProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  popoverProps?: React.ComponentProps<typeof Popover>;
  drawerProps?: React.ComponentProps<typeof Drawer>;
};

function ResponsivePopover({
  children,
  open,
  onOpenChange,
  defaultOpen,
  popoverProps,
  drawerProps,
}: ResponsivePopoverProps) {
  const isMobile = useIsMobile();
  const Component = isMobile ? Drawer : Popover;
  const props = isMobile ? drawerProps : popoverProps;

  return (
    <ResponsivePopoverContext.Provider value={{ isMobile }}>
      <Component
        open={open ?? defaultOpen}
        onOpenChange={onOpenChange}
        {...props}
      >
        {children}
      </Component>
    </ResponsivePopoverContext.Provider>
  );
}

function ResponsivePopoverTrigger({
  children,
  className,
  drawerProps,
  popoverProps,
}: {
  children: React.ReactNode;
  className?: string;
  drawerProps?: React.ComponentProps<typeof DrawerTrigger>;
  popoverProps?: React.ComponentProps<typeof PopoverTrigger>;
}) {
  const { isMobile } = useResponsivePopoverContext();
  const Trigger = isMobile ? DrawerTrigger : PopoverTrigger;
  const props = isMobile ? drawerProps : popoverProps;

  return (
    <Trigger asChild {...props} className={cn(props?.className, className)}>
      {children}
    </Trigger>
  );
}

function ResponsivePopoverContent({
  children,
  className,
  popoverProps,
  drawerProps,
}: {
  children: React.ReactNode;
  className?: string;
  popoverProps?: React.ComponentProps<typeof PopoverContent>;
  drawerProps?: React.ComponentProps<typeof DrawerContent>;
}) {
  const { isMobile } = useResponsivePopoverContext();
  const Content = isMobile ? DrawerContent : PopoverContent;
  const props = isMobile ? drawerProps : popoverProps;

  return (
    <Content
      {...props}
      className={cn(!isMobile && 'p-0', props?.className, className)}
    >
      {children}
    </Content>
  );
}

function ResponsivePopoverHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { isMobile } = useResponsivePopoverContext();
  const Header = isMobile ? DrawerHeader : PopoverHeader;
  return <Header {...props} className={cn(className)} />;
}

function ResponsivePopoverBody({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { isMobile } = useResponsivePopoverContext();
  const Body = isMobile ? DrawerBody : PopoverBody;
  return <Body {...props} className={cn(className)} />;
}

function ResponsivePopoverFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { isMobile } = useResponsivePopoverContext();
  const Footer = isMobile ? DrawerFooter : PopoverFooter;
  return <Footer {...props} className={cn(className)} />;
}

function ResponsivePopoverTitle({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  const { isMobile } = useResponsivePopoverContext();
  const Title = isMobile ? DrawerTitle : PopoverTitle;
  return <Title {...props} className={cn(className)} />;
}

function ResponsivePopoverDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  const { isMobile } = useResponsivePopoverContext();
  const Description = isMobile ? DrawerDescription : PopoverDescription;
  return <Description {...props} className={cn(className)} />;
}

function ResponsivePopoverClose({
  className,
  ...props
}: React.ComponentProps<typeof DrawerClose>) {
  const { isMobile } = useResponsivePopoverContext();
  const Close = isMobile ? DrawerClose : PopoverClose;
  return <Close {...props} className={cn(className)} />;
}

export {
  ResponsivePopover,
  ResponsivePopoverTrigger,
  ResponsivePopoverContent,
  ResponsivePopoverHeader,
  ResponsivePopoverBody,
  ResponsivePopoverTitle,
  ResponsivePopoverDescription,
  ResponsivePopoverFooter,
  ResponsivePopoverClose,
};
