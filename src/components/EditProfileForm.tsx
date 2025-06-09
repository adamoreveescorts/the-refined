
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Upload, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
  display_name: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
  // Basic details
  age: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  // Appearance fields
  ethnicity: z.string().optional(),
  body_type: z.string().optional(),
  hair_color: z.string().optional(),
  eye_color: z.string().optional(),
  cup_size: z.string().optional(),
  nationality: z.string().optional(),
  // Lifestyle fields
  smoking: z.string().optional(),
  drinking: z.string().optional(),
  languages: z.string().max(200, "Languages must be less than 200 characters").optional(),
  services: z.string().max(500, "Services must be less than 500 characters").optional(),
  // Rates fields
  hourly_rate: z.string().optional(),
  two_hour_rate: z.string().optional(),
  dinner_rate: z.string().optional(),
  overnight_rate: z.string().optional(),
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
    height?: string | null;
    weight?: string | null;
    ethnicity?: string | null;
    body_type?: string | null;
    hair_color?: string | null;
    eye_color?: string | null;
    cup_size?: string | null;
    nationality?: string | null;
    smoking?: string | null;
    drinking?: string | null;
    languages?: string | null;
    services?: string | null;
    hourly_rate?: string | null;
    two_hour_rate?: string | null;
    dinner_rate?: string | null;
    overnight_rate?: string | null;
    profile_picture?: string | null;
    tags?: string | null;
    tattoos?: boolean | null;
    piercings?: boolean | null;
  };
  onProfileUpdate: (updatedProfile: any) => void;
  onCancel: () => void;
}

const EditProfileForm = ({ profile, onProfileUpdate, onCancel }: EditProfileFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profilePicture, setProfilePicture] = useState(profile.profile_picture || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    profile.tags ? profile.tags.split(',').filter(Boolean) : []
  );
  const [tattoos, setTattoos] = useState(profile.tattoos || false);
  const [piercings, setPiercings] = useState(profile.piercings || false);

  const isEscortOrAgency = profile.role === 'escort' || profile.role === 'agency';

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username || "",
      display_name: profile.display_name || "",
      email: profile.email || "",
      bio: profile.bio || "",
      age: profile.age || "",
      height: profile.height || "",
      weight: profile.weight || "",
      ethnicity: profile.ethnicity || "",
      body_type: profile.body_type || "",
      hair_color: profile.hair_color || "",
      eye_color: profile.eye_color || "",
      cup_size: profile.cup_size || "",
      nationality: profile.nationality || "",
      smoking: profile.smoking || "",
      drinking: profile.drinking || "",
      languages: profile.languages || "",
      services: profile.services || "",
      hourly_rate: profile.hourly_rate || "",
      two_hour_rate: profile.two_hour_rate || "",
      dinner_rate: profile.dinner_rate || "",
      overnight_rate: profile.overnight_rate || "",
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
      
      // Create a unique filename with user folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/profile-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (error) {
        console.error("Storage upload error:", error);
        toast.error("Failed to upload image");
        return;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setProfilePicture(publicUrl);
      toast.success("Image uploaded successfully");
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
        updateData.height = data.height;
        updateData.weight = data.weight;
        updateData.ethnicity = data.ethnicity;
        updateData.body_type = data.body_type;
        updateData.hair_color = data.hair_color;
        updateData.eye_color = data.eye_color;
        updateData.cup_size = data.cup_size;
        updateData.nationality = data.nationality;
        updateData.smoking = data.smoking;
        updateData.drinking = data.drinking;
        updateData.languages = data.languages;
        updateData.services = data.services;
        updateData.hourly_rate = data.hourly_rate;
        updateData.two_hour_rate = data.two_hour_rate;
        updateData.dinner_rate = data.dinner_rate;
        updateData.overnight_rate = data.overnight_rate;
        updateData.profile_picture = profilePicture;
        updateData.tags = selectedTags.join(',');
        updateData.tattoos = tattoos;
        updateData.piercings = piercings;
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

            {/* Escort/Agency Specific Fields in Tabs */}
            {isEscortOrAgency && (
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="rates">Rates</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself..." 
                            className="min-h-32"
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
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., English, French, Spanish" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ethnicity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ethnicity</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ethnicity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Asian">Asian</SelectItem>
                              <SelectItem value="Black">Black</SelectItem>
                              <SelectItem value="Caucasian">Caucasian</SelectItem>
                              <SelectItem value="Hispanic">Hispanic</SelectItem>
                              <SelectItem value="Indian">Indian</SelectItem>
                              <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                              <SelectItem value="Mixed">Mixed</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="body_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Body Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select body type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Petite">Petite</SelectItem>
                              <SelectItem value="Slim">Slim</SelectItem>
                              <SelectItem value="Athletic">Athletic</SelectItem>
                              <SelectItem value="Average">Average</SelectItem>
                              <SelectItem value="Curvy">Curvy</SelectItem>
                              <SelectItem value="Full Figured">Full Figured</SelectItem>
                              <SelectItem value="BBW">BBW</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hair_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hair Color</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select hair color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Blonde">Blonde</SelectItem>
                              <SelectItem value="Brunette">Brunette</SelectItem>
                              <SelectItem value="Black">Black</SelectItem>
                              <SelectItem value="Red">Red</SelectItem>
                              <SelectItem value="Auburn">Auburn</SelectItem>
                              <SelectItem value="Grey">Grey</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eye_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Eye Color</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select eye color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Blue">Blue</SelectItem>
                              <SelectItem value="Brown">Brown</SelectItem>
                              <SelectItem value="Green">Green</SelectItem>
                              <SelectItem value="Hazel">Hazel</SelectItem>
                              <SelectItem value="Grey">Grey</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cup_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cup Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select cup size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="DD">DD</SelectItem>
                              <SelectItem value="E">E</SelectItem>
                              <SelectItem value="F">F+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Australian" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tattoos"
                        checked={tattoos}
                        onCheckedChange={setTattoos}
                      />
                      <label htmlFor="tattoos" className="text-sm font-medium">Has Tattoos</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="piercings"
                        checked={piercings}
                        onCheckedChange={setPiercings}
                      />
                      <label htmlFor="piercings" className="text-sm font-medium">Has Piercings</label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 25" type="number" {...field} />
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
                            <Input placeholder="e.g., 172cm or 5'6" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 55kg or 120lbs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smoking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Smoking</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Non-smoker">Non-smoker</SelectItem>
                              <SelectItem value="Light smoker">Light smoker</SelectItem>
                              <SelectItem value="Social smoker">Social smoker</SelectItem>
                              <SelectItem value="Regular smoker">Regular smoker</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="drinking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Drinking</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Non-drinker">Non-drinker</SelectItem>
                              <SelectItem value="Light drinker">Light drinker</SelectItem>
                              <SelectItem value="Social drinker">Social drinker</SelectItem>
                              <SelectItem value="Regular drinker">Regular drinker</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="rates" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hourly_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>1 Hour Rate ($)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 300" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="two_hour_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>2 Hours Rate ($)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 550" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dinner_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dinner Date Rate ($)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 800" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="overnight_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overnight Rate ($)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2000" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Tags Section */}
            {isEscortOrAgency && (
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
