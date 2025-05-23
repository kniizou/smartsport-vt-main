
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Calendar, Clock, Eye, MessageSquare, Search, ThumbsUp, Filter } from "lucide-react";

const News = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const newsCategories = ["Tous", "Tournois", "Mises à jour", "Esports", "Communauté"];
  
  const newsArticles = [
    {
      id: 1,
      title: "Tournoi international SmartSport 2025 annoncé",
      excerpt: "Le plus grand tournoi de l'année arrive avec un prize pool record de 1 million d'euros...",
      date: "2025-03-28",
      readTime: "4 min",
      category: "Tournois",
      image: "https://placehold.co/800x400/667eea/ffffff?text=Tournoi+2025",
      views: 3452,
      likes: 782,
      comments: 134
    },
    {
      id: 2,
      title: "Mise à jour majeure de la plateforme - Version 3.0",
      excerpt: "Découvrez les nouvelles fonctionnalités qui transformeront votre expérience de tournoi...",
      date: "2025-03-15",
      readTime: "6 min",
      category: "Mises à jour",
      image: "https://placehold.co/800x400/4c51bf/ffffff?text=Version+3.0",
      views: 2841,
      likes: 621,
      comments: 98
    },
    {
      id: 3,
      title: "Interview exclusive avec le champion eSport NeoFrag",
      excerpt: "Le triple champion nous révèle ses secrets, sa routine d'entraînement et ses plans futurs...",
      date: "2025-03-10",
      readTime: "8 min",
      category: "Esports",
      image: "https://placehold.co/800x400/8b5cf6/ffffff?text=Interview+NeoFrag",
      views: 5127,
      likes: 1243,
      comments: 221
    },
    {
      id: 4,
      title: "Nouveau système de classement - Ce qui change pour vous",
      excerpt: "Découvrez comment le nouveau système ELO amélioré va rendre les classements plus précis et équitables...",
      date: "2025-02-25",
      readTime: "5 min", 
      category: "Mises à jour",
      image: "https://placehold.co/800x400/ec4899/ffffff?text=Classement+ELO",
      views: 1893,
      likes: 473,
      comments: 87
    },
    {
      id: 5,
      title: "Résultats de la coupe d'hiver 2025",
      excerpt: "Retour sur les moments forts et les performances exceptionnelles qui ont marqué la compétition...",
      date: "2025-02-12",
      readTime: "7 min",
      category: "Tournois",
      image: "https://placehold.co/800x400/10b981/ffffff?text=Coupe+Hiver+2025",
      views: 2673,
      likes: 582,
      comments: 103
    },
    {
      id: 6,
      title: "Lancement du programme communautaire SmartSport",
      excerpt: "Comment nous soutenons les joueurs amateurs et les petites associations à travers notre nouveau programme...",
      date: "2025-01-30",
      readTime: "3 min",
      category: "Communauté",
      image: "https://placehold.co/800x400/f97316/ffffff?text=Programme+Communautaire",
      views: 1456,
      likes: 398,
      comments: 64
    }
  ];
  
  // Filtrer les articles selon la recherche
  const filteredArticles = searchTerm 
    ? newsArticles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    : newsArticles;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Actualités</h1>
            <p className="text-muted-foreground">
              Restez informé des dernières nouveautés, mises à jour et événements de la plateforme
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher des articles..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="border-border/50 px-3">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
              <Tabs defaultValue="Tous" className="w-auto">
                <TabsList>
                  {newsCategories.map((category) => (
                    <TabsTrigger key={category} value={category} className="text-xs md:text-sm">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="border border-border/50 bg-card/50 backdrop-blur-md overflow-hidden flex flex-col hover:shadow-xl transition-all">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                      {article.category}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(article.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-accent transition-colors">
                    <a href={`/news/${article.id}`}>{article.title}</a>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{article.readTime} de lecture</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-border/30 pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span>{article.views}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                      <span>{article.likes}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      <span>{article.comments}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10">
                    Lire la suite
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Aucun article trouvé</h3>
              <p className="text-muted-foreground">Essayez d'autres termes de recherche</p>
            </div>
          )}
          
          {filteredArticles.length > 0 && (
            <div className="mt-12 flex justify-center">
              <Button variant="outline" className="border-accent/30 text-accent">
                Charger plus d'articles
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default News;
