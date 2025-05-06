
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UserCircle, Users } from "lucide-react";

// Define the role type to match the database enum exactly
export type UserRole = "escort" | "client";

const formSchema = z.object({
  role: z.enum(["escort", "client"], {
    required_error: "Please select a role",
  }),
});

type RoleSelectionFormValues = z.infer<typeof formSchema>;

interface RoleSelectionModalProps {
  isOpen: boolean;
  onRoleSelect: (role: UserRole) => void;
  onClose: () => void;
}

const RoleSelectionModal = ({ isOpen, onRoleSelect, onClose }: RoleSelectionModalProps) => {
  const form = useForm<RoleSelectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "client",
    },
  });

  const onSubmit = (values: RoleSelectionFormValues) => {
    console.log("Role selected in modal:", values.role);
    onRoleSelect(values.role);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Choose Your Role</DialogTitle>
          <DialogDescription>
            Select how you would like to use The Refined Escort
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className={`flex items-center space-x-2 rounded-md border p-4 ${field.value === "escort" ? "border-gold bg-muted" : ""}`}>
                        <RadioGroupItem value="escort" id="escort" />
                        <FormLabel htmlFor="escort" className="flex items-center cursor-pointer flex-1">
                          <UserCircle className="h-5 w-5 mr-2 text-gold" />
                          <div>
                            <p className="font-medium">Sign up as an Escort</p>
                            <p className="text-sm text-muted-foreground">Create a profile and offer services</p>
                          </div>
                        </FormLabel>
                      </div>
                      
                      <div className={`flex items-center space-x-2 rounded-md border p-4 ${field.value === "client" ? "border-gold bg-muted" : ""}`}>
                        <RadioGroupItem value="client" id="client" />
                        <FormLabel htmlFor="client" className="flex items-center cursor-pointer flex-1">
                          <Users className="h-5 w-5 mr-2 text-gold" />
                          <div>
                            <p className="font-medium">Sign up as a Client</p>
                            <p className="text-sm text-muted-foreground">Browse profiles and book services</p>
                          </div>
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" className="btn-gold w-full">Continue</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionModal;
