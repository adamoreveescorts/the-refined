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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Upload, User, Edit, Images } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PhotoEditor from "./PhotoEditor";
import PhotoGalleryManager from "./PhotoGalleryManager";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
  display_name: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
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
  // Basic rates fields
  hourly_rate: z.string().optional(),
  two_hour_rate: z.string().optional(),
  dinner_rate: z.string().optional(),
  overnight_rate: z.string().optional(),
  // Incall rates fields
  incall_hourly_rate: z.string().optional(),
  incall_two_hour_rate: z.string().optional(),
  incall_dinner_rate: z.string().optional(),
  incall_overnight_rate: z.string().optional(),
  // Outcall rates fields
  outcall_hourly_rate: z.string().optional(),
  outcall_two_hour_rate: z.string().optional(),
  outcall_dinner_rate: z.string().optional(),
  outcall_overnight_rate: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  profile: {
    id: string;
    username: string | null;
    display_name: string | null;
    email: string | null;
    phone?: string | null;
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
    incall_hourly_rate?: string | null;
    incall_two_hour_rate?: string | null;
    incall_dinner_rate?: string | null;
    incall_overnight_rate?: string | null;
    outcall_hourly_rate?: string | null;
    outcall_two_hour_rate?: string | null;
    outcall_dinner_rate?: string | null;
    outcall_overnight_rate?: string | null;
    profile_picture?: string | null;
    gallery_images?: string[] | null;
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
  const [galleryImages, setGalleryImages] = useState<string[]>(profile.gallery_images || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    profile.tags ? profile.tags.split(',').filter(Boolean) : []
  );
  const [tattoos, setTattoos] = useState(profile.tattoos || false);
  const [piercings, setPiercings] = useState(profile.piercings || false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showGalleryManager, setShowGalleryManager] = useState(false);

  const isEscortOrAgency = profile.role === 'escort' || profile.role === 'agency';

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username || "",
      display_name: profile.display_name || "",
      email: profile.email || "",
      phone: profile.phone || "",
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
      incall_hourly_rate: profile.incall_hourly_rate || "",
      incall_two_hour_rate: profile.incall_two_hour_rate || "",
      incall_dinner_rate: profile.incall_dinner_rate || "",
      incall_overnight_rate: profile.incall_overnight_rate || "",
      outcall_hourly_rate: profile.outcall_hourly_rate || "",
      outcall_two_hour_rate: profile.outcall_two_hour_rate || "",
      outcall_dinner_rate: profile.outcall_dinner_rate || "",
      outcall_overnight_rate: profile.outcall_overnight_rate || "",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Set the selected file and show editor
    setSelectedImageFile(file);
    setShowPhotoEditor(true);
  };

  const handlePhotoEditorSave = async (editedFile: File) => {
    try {
      setUploadingImage(true);
      
      const fileExt = editedFile.name.split('.').pop();
      const fileName = `${profile.id}/profile-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, editedFile);

      if (error) {
        console.error("Storage upload error:", error);
        toast.error("Failed to upload image");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setProfilePicture(publicUrl);
      setShowPhotoEditor(false);
      setSelectedImageFile(null);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePhotoEditorCancel = () => {
    setShowPhotoEditor(false);
    setSelectedImageFile(null);
  };

  const handleGalleryUpdate = (newGallery: string[]) => {
    setGalleryImages(newGallery);
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
        phone: data.phone,
      };

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
        updateData.incall_hourly_rate = data.incall_hourly_rate;
        updateData.incall_two_hour_rate = data.incall_two_hour_rate;
        updateData.incall_dinner_rate = data.incall_dinner_rate;
        updateData.incall_overnight_rate = data.incall_overnight_rate;
        updateData.outcall_hourly_rate = data.outcall_hourly_rate;
        updateData.outcall_two_hour_rate = data.outcall_two_hour_rate;
        updateData.outcall_dinner_rate = data.outcall_dinner_rate;
        updateData.outcall_overnight_rate = data.outcall_overnight_rate;
        updateData.profile_picture = profilePicture;
        updateData.gallery_images = galleryImages;
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

      onProfileUpdate(updatedProfile);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-card shadow-sm border-border rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture & Gallery - Only for escorts/agencies */}
            {isEscortOrAgency && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Photos</h3>
                
                {/* Profile Picture Section */}
                <div className="space-y-2">
                  <h4 className="text-md font-medium text-foreground">Profile Picture</h4>
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
                            {uploadingImage ? "Uploading..." : "Upload & Edit Photo"}
                          </span>
                        </Button>
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Max 5MB, JPG/PNG only. Click to upload and edit with blur tool.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gallery Management Section */}
                <div className="space-y-2">
                  <h4 className="text-md font-medium text-foreground">Photo Gallery</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {galleryImages.slice(0, 3).map((image, index) => (
                        <Avatar key={index} className="h-10 w-10 border-2 border-background">
                          <AvatarImage src={image} alt={`Gallery ${index + 1}`} />
                          <AvatarFallback>
                            <Images className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {galleryImages.length > 3 && (
                        <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                          +{galleryImages.length - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowGalleryManager(true)}
                      >
                        <Images className="h-4 w-4 mr-2" />
                        Manage Photos ({galleryImages.length})
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload and manage multiple gallery photos with blur editing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Username</FormLabel>
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
                      <FormLabel className="text-foreground">Display Name</FormLabel>
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
                      <FormLabel className="text-foreground">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                        <FormLabel className="text-foreground">Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself..." 
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground">
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
                        <FormLabel className="text-foreground">Services Offered</FormLabel>
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
                        <FormLabel className="text-foreground">Languages</FormLabel>
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
                          <FormLabel className="text-foreground">Ethnicity</FormLabel>
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
                          <FormLabel className="text-foreground">Body Type</FormLabel>
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
                          <FormLabel className="text-foreground">Hair Color</FormLabel>
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
                          <FormLabel className="text-foreground">Eye Color</FormLabel>
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
                          <FormLabel className="text-foreground">Cup Size</FormLabel>
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
                          <FormLabel className="text-foreground">Nationality</FormLabel>
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
                        onCheckedChange={(checked) => setTattoos(checked === true)}
                      />
                      <label htmlFor="tattoos" className="text-sm font-medium text-foreground">Has Tattoos</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="piercings"
                        checked={piercings}
                        onCheckedChange={(checked) => setPiercings(checked === true)}
                      />
                      <label htmlFor="piercings" className="text-sm font-medium text-foreground">Has Piercings</label>
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
                          <FormLabel className="text-foreground">Age</FormLabel>
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
                          <FormLabel className="text-foreground">Height</FormLabel>
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
                          <FormLabel className="text-foreground">Weight</FormLabel>
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
                          <FormLabel className="text-foreground">Smoking</FormLabel>
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
                          <FormLabel className="text-foreground">Drinking</FormLabel>
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
                
                <TabsContent value="rates" className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-foreground mb-3">General Rates</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="hourly_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">1 Hour Rate ($)</FormLabel>
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
                              <FormLabel className="text-foreground">2 Hours Rate ($)</FormLabel>
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
                              <FormLabel className="text-foreground">Dinner Date Rate ($)</FormLabel>
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
                              <FormLabel className="text-foreground">Overnight Rate ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 2000" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-foreground mb-3">Incall Rates</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="incall_hourly_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Incall 1 Hour ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 250" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="incall_two_hour_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Incall 2 Hours ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 450" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="incall_dinner_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Incall Dinner Date ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 700" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="incall_overnight_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Incall Overnight ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 1800" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-foreground mb-3">Outcall Rates</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="outcall_hourly_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Outcall 1 Hour ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 350" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="outcall_two_hour_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Outcall 2 Hours ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 650" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="outcall_dinner_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Outcall Dinner Date ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 900" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="outcall_overnight_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Outcall Overnight ($)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 2200" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Tags Section */}
            {isEscortOrAgency && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Tags</h3>
                <p className="text-sm text-muted-foreground">Select tags that describe your services</p>
                <div className="flex flex-wrap gap-2">
                  {commonTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedTags.includes(tag) 
                          ? "bg-gold text-white hover:bg-gold/80" 
                          : "hover:bg-muted"
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
      </div>

      {/* Profile Picture Editor Dialog */}
      <Dialog open={showPhotoEditor} onOpenChange={setShowPhotoEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Your Photo</DialogTitle>
          </DialogHeader>
          {selectedImageFile && (
            <PhotoEditor
              imageFile={selectedImageFile}
              onSave={handlePhotoEditorSave}
              onCancel={handlePhotoEditorCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Gallery Manager Dialog */}
      <PhotoGalleryManager
        isOpen={showGalleryManager}
        onClose={() => setShowGalleryManager(false)}
        userId={profile.id}
        currentGallery={galleryImages}
        onGalleryUpdate={handleGalleryUpdate}
      />
    </>
  );
};

export default EditProfileForm;
