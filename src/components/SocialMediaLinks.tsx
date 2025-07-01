
import { Instagram, Twitter, Facebook, Linkedin, Youtube } from "lucide-react";
import { Button } from "./ui/button";

interface SocialMediaLinksProps {
  instagram_url?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
}

const SocialMediaLinks = ({
  instagram_url,
  twitter_url,
  facebook_url,
  linkedin_url,
  youtube_url,
}: SocialMediaLinksProps) => {
  const socialLinks = [
    { url: instagram_url, icon: Instagram, name: "Instagram", color: "hover:text-pink-600" },
    { url: twitter_url, icon: Twitter, name: "Twitter", color: "hover:text-blue-400" },
    { url: facebook_url, icon: Facebook, name: "Facebook", color: "hover:text-blue-600" },
    { url: linkedin_url, icon: Linkedin, name: "LinkedIn", color: "hover:text-blue-700" },
    { url: youtube_url, icon: Youtube, name: "YouTube", color: "hover:text-red-600" },
  ].filter(link => link.url && link.url.trim() !== "");

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {socialLinks.map(({ url, icon: Icon, name, color }) => (
        <Button
          key={name}
          variant="ghost"
          size="sm"
          className={`p-2 ${color}`}
          asChild
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
          >
            <Icon className="h-4 w-4" />
          </a>
        </Button>
      ))}
    </div>
  );
};

export default SocialMediaLinks;
