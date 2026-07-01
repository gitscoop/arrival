import { Button } from "@/components/ui/button";
import * as SignIn from "@clerk/elements/sign-in";

interface AlternativeMethodsProps {
  isLoading: boolean;
}

export function AlternativeMethods({ isLoading }: AlternativeMethodsProps) {
  return (
    <SignIn.Action navigate="choose-strategy" asChild>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        className="w-full"
      >
        Use another method
      </Button>
    </SignIn.Action>
  );
}
