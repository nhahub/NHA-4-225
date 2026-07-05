"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { GoalStepper } from "@/components/goals/goal-stepper";
import { WizardStepWhat } from "@/components/goals/wizard-step-what";
import { WizardStepWhen } from "@/components/goals/wizard-step-when";
import { WizardStepMilestones } from "@/components/goals/wizard-step-milestones";
import { useCreateGoal } from "@/features/goals/hooks";
import {
  goalWizardSchema,
  STEP_FIELDS,
  STEPS,
  STEP_TITLE_EN,
  type GoalWizardFormInput,
  type GoalWizardFormOutput,
  type StepKey,
} from "@/features/goals/schemas";

const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const todayIso = toISODate(new Date());
const inTwelveWeeksIso = toISODate(
  new Date(Date.now() + 84 * 86_400_000),
);

const STEP_HEADING: Record<StepKey, string> = {
  what: STEP_TITLE_EN.what,
  when: STEP_TITLE_EN.when,
  milestones: STEP_TITLE_EN.milestones,
};

function defaultValues(): GoalWizardFormInput {
  return {
    title: "",
    description: "",
    measure: "",
    category: "education_work",
    customCategory: "",
    relevance: "",
    cycleStart: new Date(todayIso),
    cycleEnd: new Date(inTwelveWeeksIso),
    milestones: [],
  };
}

export function GoalWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { submit, isPending } = useCreateGoal();

  const form = useForm<GoalWizardFormInput, unknown, GoalWizardFormOutput>({
    resolver: zodResolver(goalWizardSchema),
    mode: "onTouched",
    defaultValues: defaultValues(),
  });

  const stepKey = STEPS[step - 1] as StepKey;
  const isLastStep = step === STEPS.length;

  const goNext = async () => {
    const valid = await form.trigger(
      [...STEP_FIELDS[stepKey]] as unknown as Parameters<
        typeof form.trigger
      >[0],
      { shouldFocus: true },
    );
    if (valid && !isLastStep) {
      setStep((s) => (s + 1) as 1 | 2 | 3);
    }
  };

  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const onComplete = form.handleSubmit(async (data) => {
    const result = await submit(data);
    if (result.ok) {
      toast.success("Goal saved (mock). Open the console to see the payload.");
      form.reset(defaultValues());
      setStep(1);
    } else {
      toast.error(result.error);
    }
  });

  return (
    <FormProvider {...form}>
      <Card className="w-full">
        <CardHeader className="gap-3">
          <GoalStepper currentStep={step} />
          <p className="text-muted-foreground text-xs">
            Step {step} of {STEPS.length} · {STEP_HEADING[stepKey]}
          </p>
        </CardHeader>

        <CardContent>
          {stepKey === "what" ? <WizardStepWhat /> : null}
          {stepKey === "when" ? <WizardStepWhen /> : null}
          {stepKey === "milestones" ? <WizardStepMilestones /> : null}
        </CardContent>

        <CardFooter className="bg-transparent">
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 1 || isPending}
            >
              Back
            </Button>
            {isLastStep ? (
              <Button
                type="button"
                onClick={onComplete}
                disabled={isPending}
              >
                {isPending ? "Saving…" : "Save goal"}
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                Next
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </FormProvider>
  );
}
