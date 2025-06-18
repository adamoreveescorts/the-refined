
import { supabase } from '@/integrations/supabase/client';

// Realistic data arrays for random selection
const availabilityOptions = [
  "Monday-Friday 9am-6pm",
  "Evenings and weekends",
  "Available by appointment",
  "24/7 availability", 
  "Tuesday-Saturday evenings",
  "Weekdays only",
  "Flexible hours",
  "Monday-Wednesday 10am-8pm",
  "Thursday-Sunday available",
  "Weekends and evenings",
  "Business hours only",
  "After 6pm weekdays, anytime weekends"
];

const nationalityOptions = [
  "Australian", "British", "American", "Canadian", "French", "German", "Italian", "Spanish",
  "Japanese", "Chinese", "Korean", "Thai", "Vietnamese", "Indian", "Brazilian", "Russian",
  "Polish", "Swedish", "Norwegian", "Dutch", "Belgian", "Swiss", "Greek", "Turkish",
  "Lebanese", "South African", "New Zealander", "Irish", "Portuguese", "Czech"
];

const smokingOptions = [
  "Non-smoker", "Light smoker", "Social smoker", "Regular smoker"
];

const drinkingOptions = [
  "Non-drinker", "Light drinker", "Social drinker", "Regular drinker"
];

const ethnicityOptions = [
  "Caucasian", "Asian", "Mediterranean", "Middle Eastern", "Mixed", "Hispanic", 
  "African", "Indian", "Pacific Islander", "European", "Scandinavian"
];

const bodyTypeOptions = [
  "Petite", "Slim", "Athletic", "Average", "Curvy", "Full Figured", "BBW"
];

const hairColorOptions = [
  "Blonde", "Brunette", "Black", "Red", "Auburn", "Grey"
];

const eyeColorOptions = [
  "Blue", "Brown", "Green", "Hazel", "Grey"
];

const servicesOptions = [
  ["Companionship", "Dinner dates", "Social events"],
  ["GFE", "Companionship", "Travel companion"],
  ["Massage", "Relaxation", "Companionship"],
  ["PSE", "Adventure", "Role play"],
  ["Travel companion", "Weekend getaways", "Dinner dates"],
  ["Business events", "Social companion", "Cultural events"],
  ["Massage therapy", "Stress relief", "Companionship"],
  ["Adventure companion", "Outdoor activities", "Travel"],
  ["Cultural events", "Art galleries", "Theater companion"],
  ["Fitness companion", "Health & wellness", "Active lifestyle"]
];

const languagesOptions = [
  ["English"], 
  ["English", "Spanish"], 
  ["English", "French"], 
  ["English", "German"], 
  ["English", "Italian"], 
  ["English", "Japanese"], 
  ["English", "Mandarin"], 
  ["English", "Korean"], 
  ["English", "Thai"], 
  ["English", "Russian"],
  ["English", "Portuguese"],
  ["English", "Dutch"],
  ["English", "Swedish"]
];

// Helper function to get random item from array
const getRandomItem = (array: any[]) => array[Math.floor(Math.random() * array.length)];

// Helper function to generate realistic weight based on height and body type
const generateWeight = (height: string, bodyType: string) => {
  const heightNum = parseInt(height?.replace(/\D/g, '') || '165');
  let baseWeight = heightNum - 110; // Basic calculation
  
  switch (bodyType) {
    case 'Petite':
      baseWeight -= 10;
      break;
    case 'Slim':
      baseWeight -= 5;
      break;
    case 'Athletic':
      baseWeight += 2;
      break;
    case 'Curvy':
      baseWeight += 8;
      break;
    case 'Full Figured':
      baseWeight += 15;
      break;
    case 'BBW':
      baseWeight += 25;
      break;
    default:
      // Average - no change
  }
  
  return `${Math.max(45, baseWeight)}kg`;
};

// Function to clean up a single profile
export const cleanupProfile = async (profile: any) => {
  const nationality = getRandomItem(nationalityOptions);
  const smoking = getRandomItem(smokingOptions);
  const drinking = getRandomItem(drinkingOptions);
  const ethnicity = profile.ethnicity || getRandomItem(ethnicityOptions);
  const bodyType = profile.body_type || getRandomItem(bodyTypeOptions);
  const hairColor = profile.hair_color || getRandomItem(hairColorOptions);
  const eyeColor = profile.eye_color || getRandomItem(eyeColorOptions);
  const availability = getRandomItem(availabilityOptions);
  const services = getRandomItem(servicesOptions).join(', ');
  const languages = getRandomItem(languagesOptions).join(', ');
  const weight = generateWeight(profile.height, bodyType);

  // Generate more realistic rates
  const hourlyRate = 200 + Math.floor(Math.random() * 600); // $200-800
  const rates = `$${hourlyRate}/hour, $${hourlyRate * 2.5}/overnight`;

  const updateData = {
    nationality,
    smoking,
    drinking,
    ethnicity,
    body_type: bodyType,
    hair_color: hairColor,
    eye_color: eyeColor,
    availability,
    services,
    languages,
    weight,
    rates,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', profile.id);

  if (error) {
    console.error(`Error updating profile ${profile.id}:`, error);
    return false;
  }
  
  return true;
};

// Function to cleanup all profiles
export const cleanupAllProfiles = async () => {
  console.log('Starting profile data cleanup...');
  
  try {
    // Fetch all escort profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'escort');

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    if (!profiles) {
      console.log('No profiles found');
      return;
    }

    console.log(`Found ${profiles.length} profiles to cleanup`);
    
    let successCount = 0;
    let errorCount = 0;

    // Process profiles in batches of 10 to avoid overwhelming the database
    for (let i = 0; i < profiles.length; i += 10) {
      const batch = profiles.slice(i, i + 10);
      
      const batchPromises = batch.map(async (profile) => {
        const success = await cleanupProfile(profile);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
        return success;
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`Processed batch ${Math.floor(i/10) + 1}/${Math.ceil(profiles.length/10)}`);
    }

    console.log(`Cleanup completed! Success: ${successCount}, Errors: ${errorCount}`);
    return { success: successCount, errors: errorCount, total: profiles.length };
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
};
