import * as React from 'react';

import {
  FlipButton as FlipButtonPrimitive,
  FlipButtonFront as FlipButtonFrontPrimitive,
  FlipButtonBack as FlipButtonBackPrimitive,
} from '@/components/animate-ui/primitives/buttons/flip';
import { getStrictContext } from '@/lib/get-strict-context';
import { buttonVariants } from '@/components/animate-ui/components/buttons/button';
import { cn } from '@/lib/utils';

const [FlipButtonProvider, useFlipButton] =
  getStrictContext('FlipButtonContext');

function FlipButton({
  variant,
  size,
  ...props
}) {
  return (
    <FlipButtonProvider value={{ variant, size }}>
      <FlipButtonPrimitive {...props} />
    </FlipButtonProvider>
  );
}

function FlipButtonFront({
  variant,
  size,
  className,
  ...props
}) {
  const { variant: buttonVariant, size: buttonSize } = useFlipButton();
  return (
    <FlipButtonFrontPrimitive
      className={cn(buttonVariants({
        variant: variant ?? buttonVariant,
        size: size ?? buttonSize,
        className,
      }))}
      {...props} />
  );
}

function FlipButtonBack({
  variant,
  size,
  className,
  ...props
}) {
  const { variant: buttonVariant, size: buttonSize } = useFlipButton();
  return (
    <FlipButtonBackPrimitive
      className={cn(buttonVariants({
        variant: variant ?? buttonVariant,
        size: size ?? buttonSize,
        className,
      }))}
      {...props} />
  );
}

export { FlipButton, FlipButtonFront, FlipButtonBack };
