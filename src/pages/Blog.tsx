import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, User } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  image: string;
  readTime: string;
}

const Blog = () => {
  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "The Art of Meaningful Connection in the Digital Age",
      excerpt: "Exploring how genuine connections can flourish even in today's fast-paced digital landscape.",
      category: "Relationships",
      date: "May 2, 2025",
      author: "Claire Beaumont",
      image: "/lovable-uploads/3d7db99a-24d6-4da9-9949-f5e481ca2c96.jpg",
      readTime: "6 min read"
    },
    {
      id: "2",
      title: "Etiquette and Elegance: The Foundations of Refined Companionship",
      excerpt: "Understanding the timeless principles that elevate social interactions to an art form.",
      category: "Etiquette",
      date: "April 28, 2025",
      author: "Jonathan Mercer",
      image: "/lovable-uploads/25a0dcad-e367-4364-9eab-c61f3ebd5a3b.png",
      readTime: "8 min read"
    },
    {
      id: "3",
      title: "Privacy and Discretion in the Modern World",
      excerpt: "Navigating privacy concerns while maintaining authentic connections in today's interconnected society.",
      category: "Privacy",
      date: "April 15, 2025",
      author: "Alexandra Stone",
      image: "/placeholder.svg",
      readTime: "5 min read"
    },
    {
      id: "4",
      title: "The Psychology of Attraction: Beyond Physical Appearance",
      excerpt: "Delving into the complex factors that create genuine attraction and lasting interest.",
      category: "Psychology",
      date: "April 10, 2025",
      author: "Dr. Marcus Wells",
      image: "/placeholder.svg",
      readTime: "10 min read"
    },
    {
      id: "5",
      title: "Cultural Intelligence: The Key to Meaningful Global Connections",
      excerpt: "How understanding different cultural nuances enhances relationships across borders.",
      category: "Culture",
      date: "April 3, 2025",
      author: "Sophia Chen",
      image: "/placeholder.svg",
      readTime: "7 min read"
    },
    {
      id: "6",
      title: "The Evolution of Companionship Services in the 21st Century",
      excerpt: "Tracing the transformation of the industry from its origins to today's sophisticated offerings.",
      category: "Industry",
      date: "March 25, 2025",
      author: "William Harrington",
      image: "/placeholder.svg",
      readTime: "9 min read"
    }
  ];

  const featuredPost = blogPosts[0];
  const regularPosts = blogPosts.slice(1);

  const categories = ["All", "Relationships", "Etiquette", "Privacy", "Psychology", "Culture", "Industry"];
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-card py-16 lg:py-24 text-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">The Refined Journal</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Insights, stories, and wisdom from the world of refined companionship.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Blog Categories */}
        <div className="bg-card border-b border-border sticky top-16 z-40 backdrop-blur-md bg-card/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="overflow-x-auto">
              <div className="flex space-x-2 md:space-x-4 min-w-max">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      index === 0
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-accent text-foreground hover:bg-muted"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Post */}
        <section className="py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid md:grid-cols-2 gap-8 items-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="rounded-xl overflow-hidden h-96">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="inline-block bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-medium mb-4">
                  {featuredPost.category}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">{featuredPost.author}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="mr-4">{featuredPost.date}</span>
                  <span>{featuredPost.readTime}</span>
                </div>
                <Link 
                  to={`/blog/${featuredPost.id}`}
                  className="inline-flex items-center text-secondary font-medium hover:text-secondary/80 transition-colors"
                >
                  Read Article <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Regular Posts Grid */}
        <section className="py-12 lg:py-16 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <motion.div 
                  key={post.id}
                  className="bg-card rounded-xl overflow-hidden shadow-sm border border-border transition-all hover:shadow-md"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                >
                  <div className="h-60 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-medium mb-3">
                      {post.category}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{post.readTime}</span>
                      </div>
                      <Link 
                        to={`/blog/${post.id}`}
                        className="text-secondary font-medium hover:text-secondary/80 transition-colors"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 lg:py-24 bg-card text-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">Subscribe to Our Newsletter</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stay updated with our latest articles, interviews, and industry insights.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent flex-grow text-foreground"
                />
                <button 
                  type="submit" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-3 px-6 rounded-md"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
