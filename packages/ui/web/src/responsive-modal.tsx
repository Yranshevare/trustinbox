'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';
import { useMediaQuery } from './hooks/use-media-query';

interface BaseProps {
  children: React.ReactNode;
}

interface RootResponsiveProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ResponsiveProps extends BaseProps {
  className?: string;
  asChild?: true;
}

const ResponsiveContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: false,
});

const useResponsiveContext = () => {
  const context = React.useContext(ResponsiveContext);
  if (!context) {
    throw new Error(
      'Responsive components cannot be rendered outside the Responsive Context',
    );
  }
  return context;
};

const Responsive = ({ children, ...props }: RootResponsiveProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const Responsive = isDesktop ? Dialog : Drawer;

  return (
    <ResponsiveContext.Provider value={{ isDesktop }}>
      <Responsive {...props} {...(!isDesktop && { autoFocus: true })}>
        {children}
      </Responsive>
    </ResponsiveContext.Provider>
  );
};

const ResponsiveTrigger = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext();
  const ResponsiveTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

  return (
    <ResponsiveTrigger asChild className={className} {...props}>
      {children}
    </ResponsiveTrigger>
  );
};

const ResponsiveClose = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext();
  const ResponsiveClose = isDesktop ? DialogClose : DrawerClose;

  return (
    <ResponsiveClose className={className} {...props}>
      {children}
    </ResponsiveClose>
  );
};

const ResponsiveContent = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext();
  const ResponsiveContent = isDesktop ? DialogContent : DrawerContent;

  return (
    <ResponsiveContent className={className} {...props}>
      {children}
    </ResponsiveContent>
  );
};

const ResponsiveDescription = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext();
  const ResponsiveDescription = isDesktop
    ? DialogDescription
    : DrawerDescription;

  return (
    <ResponsiveDescription className={className} {...props}>
      {children}
    </ResponsiveDescription>
  );
};

const ResponsiveHeader = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext();
  const ResponsiveHeader = isDesktop ? DialogHeader : DrawerHeader;

  return (
    <ResponsiveHeader className={className} {...props}>
      {children}
    </ResponsiveHeader>
  );
};

const ResponsiveTitle = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext();
  const ResponsiveTitle = isDesktop ? DialogTitle : DrawerTitle;

  return (
    <ResponsiveTitle className={className} {...props}>
      {children}
    </ResponsiveTitle>
  );
};

const ResponsiveBody = ({ className, children, ...props }: ResponsiveProps) => {
  return (
    <div className={cn('px-4 md:px-0', className)} {...props}>
      {children}
    </div>
  );
};

const ResponsiveFooter = ({
  className,
  children,
  ...props
}: ResponsiveProps) => {
  const { isDesktop } = useResponsiveContext();
  const ResponsiveFooter = isDesktop ? DialogFooter : DrawerFooter;

  return (
    <ResponsiveFooter className={className} {...props}>
      {children}
    </ResponsiveFooter>
  );
};

export {
  Responsive as ResponsiveModal,
  ResponsiveTrigger as ResponsiveModalTrigger,
  ResponsiveClose as ResponsiveModalClose,
  ResponsiveContent as ResponsiveModalContent,
  ResponsiveDescription as ResponsiveModalDescription,
  ResponsiveHeader as ResponsiveModalHeader,
  ResponsiveTitle as ResponsiveModalTitle,
  ResponsiveBody as ResponsiveModalBody,
  ResponsiveFooter as ResponsiveModalFooter,
};
