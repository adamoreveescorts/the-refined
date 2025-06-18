
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cleanupAllProfiles } from '@/utils/profileDataCleanup';
import { AlertTriangle, CheckCircle, Play } from 'lucide-react';

const ProfileDataCleanup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; errors: number; total: number } | null>(null);

  const handleCleanup = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);
    
    try {
      toast.info('Starting profile data cleanup...');
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 10, 95));
      }, 500);

      const result = await cleanupAllProfiles();
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(result);
      
      if (result.errors === 0) {
        toast.success(`Successfully cleaned up ${result.success} profiles!`);
      } else {
        toast.warning(`Cleanup completed with ${result.errors} errors. ${result.success} profiles updated successfully.`);
      }
      
    } catch (error) {
      console.error('Cleanup failed:', error);
      toast.error('Profile cleanup failed. Please check the console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Profile Data Cleanup
        </CardTitle>
        <CardDescription>
          Clean up all escort profiles with realistic data including availability, nationality, 
          smoking/drinking preferences, and other missing filter options.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="font-medium text-yellow-800 mb-2">What this will do:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Fix nonsensical availability entries (e.g., "ultra-rare beauty" → "Monday-Friday 9am-6pm")</li>
            <li>• Add missing nationality, smoking, and drinking preferences</li>
            <li>• Populate missing ethnicity, body type, hair/eye colors</li>
            <li>• Generate realistic weight based on height and body type</li>
            <li>• Diversify services and make them more realistic</li>
            <li>• Add language options</li>
            <li>• Update rates to be more realistic</li>
          </ul>
        </div>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing profiles...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {results && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-800">Cleanup Results</h4>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>Total profiles processed: {results.total}</p>
              <p>Successfully updated: {results.success}</p>
              <p>Errors: {results.errors}</p>
            </div>
          </div>
        )}

        <Button 
          onClick={handleCleanup} 
          disabled={isRunning}
          className="w-full"
          size="lg"
        >
          <Play className="h-4 w-4 mr-2" />
          {isRunning ? 'Cleaning Up Profiles...' : 'Start Profile Cleanup'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileDataCleanup;
