
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UserCircle, Users, Building2 } from "lucide-react";

// Define the role type to match the database enum exactly
export type UserRole = "escort" | "client" | "agency";

const formSchema = z.object({
  role: z.enum(["escort", "client", "agency"], {
    required_error: "Please select a role",
  }),
});

type RoleSelectionFormValues = z.infer<typeof formSchema>;

interface RoleSelectionModalProps {
  isOpen: boolean;
  onRoleSelect: (role: UserRole) => void;
  onClose: () => void;
  inline?: boolean;
}

const RoleSelectionModal = ({ isOpen, onRoleSelect, onClose, inline = false }: RoleSelectionModalProps) => {
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

  const RoleSelectionContent = () => (
    <>
      <div className="mb-6">
        <h3 className="text-xl font-serif text-center mb-2">Choose Your Role</h3>
        <p className="text-sm text-muted-foreground text-center">
          Select how you would like to use Adam or Eve Escorts
        </p>
      </div>

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
                          <p className="text-sm text-muted-foreground">Create a profile and offer services (Paid subscription - 1 week free trial available)</p>
                        </div>
                      </FormLabel>
                    </div>
                    
                    <div className={`flex items-center space-x-2 rounded-md border p-4 ${field.value === "agency" ? "border-gold bg-muted" : ""}`}>
                      <RadioGroupItem value="agency" id="agency" />
                      <FormLabel htmlFor="agency" className="flex items-center cursor-pointer flex-1">
                        <Building2 className="h-5 w-5 mr-2 text-gold" />
                        <div>
                          <p className="font-medium">Sign up as an Agency</p>
                          <p className="text-sm text-muted-foreground">Manage multiple profiles and services (Paid subscription - 1 week free trial available)</p>
                        </div>
                      </FormLabel>
                    </div>
                    
                    <div className={`flex items-center space-x-2 rounded-md border p-4 ${field.value === "client" ? "border-gold bg-muted" : ""}`}>
                      <RadioGroupItem value="client" id="client" />
                      <FormLabel htmlFor="client" className="flex items-center cursor-pointer flex-1">
                        <Users className="h-5 w-5 mr-2 text-gold" />
                        <div>
                          <p className="font-medium">Sign up as a Client</p>
                          <p className="text-sm text-muted-foreground">Browse profiles and book services (Free)</p>
                        </div>
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="btn-gold w-full">Continue</Button>
        </form>
      </Form>
    </>
  );

  if (inline) {
    return (
      <div className="space-y-4">
        <RoleSelectionContent />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Choose Your Role</DialogTitle>
          <DialogDescription>
            Select how you would like to use Adam or Eve Escorts
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
                            <p className="text-sm text-muted-foreground">Create a profile and offer services (Paid subscription - 1 week free trial available)</p>
                          </div>
                        </FormLabel>
                      </div>
                      
                      <div className={`flex items-center space-x-2 rounded-md border p-4 ${field.value === "agency" ? "border-gold bg-muted" : ""}`}>
                        <RadioGroupItem value="agency" id="agency" />
                        <FormLabel htmlFor="agency" className="flex items-center cursor-pointer flex-1">
                          <Building2 className="h-5 w-5 mr-2 text-gold" />
                          <div>
                            <p className="font-medium">Sign up as an Agency</p>
                            <p className="text-sm text-muted-foreground">Manage multiple profiles and services (Paid subscription - 1 week free trial available)</p>
                          </div>
                        </FormLabel>
                      </div>
                      
                      <div className={`flex items-center space-x-2 rounded-md border p-4 ${field.value === "client" ? "border-gold bg-muted" : ""}`}>
                        <RadioGroupItem value="client" id="client" />
                        <FormLabel htmlFor="client" className="flex items-center cursor-pointer flex-1">
                          <Users className="h-5 w-5 mr-2 text-gold" />
                          <div>
                            <p className="font-medium">Sign up as a Client</p>
                            <p className="text-sm text-muted-foreground">Browse profiles and book services (Free)</p>
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
