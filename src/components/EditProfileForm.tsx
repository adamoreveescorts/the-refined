
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Upload, User } from "lucide-react";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
  display_name: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
  age: z.string().optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  height: z.string().max(20, "Height must be less than 20 characters").optional(),
  languages: z.string().max(200, "Languages must be less than 200 characters").optional(),
  services: z.string().max(500, "Services must be less than 500 characters").optional(),
  rates: z.string().max(300, "Rates must be less than 300 characters").optional(),
  availability: z.string().max(300, "Availability must be less than 300 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  profile: {
    id: string;
    username: string | null;
    display_name: string | null;
    email: string | null;
    role: string | null;
    bio?: string | null;
    age?: string | null;
    location?: string | null;
    height?: string | null;
    languages?: string | null;
    services?: string | null;
    rates?: string | null;
    availability?: string | null;
    profile_picture?: string | null;
  };
  onProfileUpdate: (updatedProfile: any) => void;
  onCancel: () => void;
}

const EditProfileForm = ({ profile, onProfileUpdate, onCancel }: EditProfileFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profilePicture, setProfilePicture] = useState(profile.profile_picture || "");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const isEscortOrAgency = profile.role === 'escort' || profile.role === 'agency';

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username || "",
      display_name: profile.display_name || "",
      email: profile.email || "",
      bio: profile.bio || "",
      age: profile.age || "",
      location: profile.location || "",
      height: profile.height || "",
      languages: profile.languages || "",
      services: profile.services || "",
      rates: profile.rates || "",
      availability: profile.availability || "",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

      // For now, we'll use a data URL since we don't have storage configured
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
        toast.success("Image uploaded successfully");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const commonTags = [
    "Companion", "Dinner Date", "Travel", "Events", "Business", "Social",
    "Overnight", "Weekend", "Outcall", "Incall", "Mature", "Young", "Blonde", "Brunette"
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);

      const updateData: any = {
        username: data.username,
        display_name: data.display_name,
        email: data.email,
      };

      // Add escort-specific fields only if user is escort or agency
      if (isEscortOrAgency) {
        updateData.bio = data.bio;
        updateData.age = data.age;
        updateData.location = data.location;
        updateData.height = data.height;
        updateData.languages = data.languages;
        updateData.services = data.services;
        updateData.rates = data.rates;
        updateData.availability = data.availability;
        updateData.profile_picture = profilePicture;
        updateData.tags = selectedTags.join(',');
      }

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
      onProfileUpdate(updatedProfile);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-navy">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture - Only for escorts/agencies */}
            {isEscortOrAgency && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Picture</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profilePicture} alt="Profile" />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-picture"
                    />
                    <label htmlFor="profile-picture">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingImage}
                        asChild
                      >
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingImage ? "Uploading..." : "Upload Photo"}
                        </span>
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500 mt-1">Max 5MB, JPG/PNG only</p>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Escort/Agency Specific Fields */}
            {isEscortOrAgency && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself..." 
                            className="min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Share what makes you unique (max 1000 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 25" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 5'6\" or 168cm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State/Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages</FormLabel>
                        <FormControl>
                          <Input placeholder="English, Spanish, French..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Services & Availability</h3>
                  
                  <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Services Offered</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the services you offer..."
                            className="min-h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rates</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your pricing structure..."
                            className="min-h-16"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="When are you available? Days, hours, advance notice needed..."
                            className="min-h-16"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tags</h3>
                  <p className="text-sm text-gray-500">Select tags that describe your services</p>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          selectedTags.includes(tag) 
                            ? "bg-gold text-white hover:bg-gold/80" 
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                        {selectedTags.includes(tag) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-4 pt-6">
              <Button
                type="submit"
                className="btn-gold flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Profile"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;
