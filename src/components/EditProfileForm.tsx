
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, DollarSign, FileText, Camera } from "lucide-react";

const profileSchema = z.object({
  display_name: z.string().min(1, "Display name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  age: z.string().optional(),
  height: z.string().optional(),
  services: z.string().optional(),
  languages: z.string().optional(),
  incall_hourly_rate: z.string().optional(),
  outcall_hourly_rate: z.string().optional(),
  incall_two_hour_rate: z.string().optional(),
  outcall_two_hour_rate: z.string().optional(),
  incall_dinner_rate: z.string().optional(),
  outcall_dinner_rate: z.string().optional(),
  incall_overnight_rate: z.string().optional(),
  outcall_overnight_rate: z.string().optional(),
  availability: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  profile: any;
  onProfileUpdate: (updatedProfile: any) => void;
  onCancel: () => void;
}

const EditProfileForm = ({ profile, onProfileUpdate, onCancel }: EditProfileFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile.display_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      location: profile.location || '',
      age: profile.age || '',
      height: profile.height || '',
      services: profile.services || '',
      languages: profile.languages || '',
      incall_hourly_rate: profile.incall_hourly_rate || '',
      outcall_hourly_rate: profile.outcall_hourly_rate || '',
      incall_two_hour_rate: profile.incall_two_hour_rate || '',
      outcall_two_hour_rate: profile.outcall_two_hour_rate || '',
      incall_dinner_rate: profile.incall_dinner_rate || '',
      outcall_dinner_rate: profile.outcall_dinner_rate || '',
      incall_overnight_rate: profile.incall_overnight_rate || '',
      outcall_overnight_rate: profile.outcall_overnight_rate || '',
      availability: profile.availability || '',
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', profile.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      onProfileUpdate({ ...profile, ...data });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                {...register("display_name")}
                placeholder="How you want to be known"
              />
              {errors.display_name && (
                <p className="text-sm text-red-500 mt-1">{errors.display_name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                {...register("age")}
                placeholder="e.g., 25"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell clients about yourself, your personality, and what makes you special..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              A compelling bio helps attract the right clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="City, State/Province"
              />
            </div>
            
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                {...register("height")}
                placeholder="e.g., 5'6\" or 168cm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Clients can request your email for direct communication
              </p>
            </div>
            
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="+1 (555) 123-4567"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Clients can request your phone number for direct contact
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services & Rates - only show for escorts/agencies */}
      {(profile.role === 'escort' || profile.role === 'agency') && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Services & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="services">Services Offered</Label>
                <Textarea
                  id="services"
                  {...register("services")}
                  placeholder="List the services you provide, separated by commas"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="languages">Languages Spoken</Label>
                  <Input
                    id="languages"
                    {...register("languages")}
                    placeholder="English, Spanish, French"
                  />
                </div>
                
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    {...register("availability")}
                    placeholder="e.g., Weekdays 9am-11pm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Rates & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Hourly Rates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incall_hourly_rate">Incall (1 Hour)</Label>
                    <Input
                      id="incall_hourly_rate"
                      {...register("incall_hourly_rate")}
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outcall_hourly_rate">Outcall (1 Hour)</Label>
                    <Input
                      id="outcall_hourly_rate"
                      {...register("outcall_hourly_rate")}
                      placeholder="400"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Extended Rates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incall_two_hour_rate">Incall (2 Hours)</Label>
                    <Input
                      id="incall_two_hour_rate"
                      {...register("incall_two_hour_rate")}
                      placeholder="550"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outcall_two_hour_rate">Outcall (2 Hours)</Label>
                    <Input
                      id="outcall_two_hour_rate"
                      {...register("outcall_two_hour_rate")}
                      placeholder="650"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Special Occasions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incall_dinner_rate">Incall (Dinner Date)</Label>
                    <Input
                      id="incall_dinner_rate"
                      {...register("incall_dinner_rate")}
                      placeholder="800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outcall_dinner_rate">Outcall (Dinner Date)</Label>
                    <Input
                      id="outcall_dinner_rate"
                      {...register("outcall_dinner_rate")}
                      placeholder="900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="incall_overnight_rate">Incall (Overnight)</Label>
                    <Input
                      id="incall_overnight_rate"
                      {...register("incall_overnight_rate")}
                      placeholder="1500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outcall_overnight_rate">Outcall (Overnight)</Label>
                    <Input
                      id="outcall_overnight_rate"
                      {...register("outcall_overnight_rate")}
                      placeholder="1800"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditProfileForm;
