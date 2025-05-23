
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { HelpCircle, FileQuestion, BookOpen, MessageSquare, PhoneCall, Mail } from "lucide-react";

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Support</h1>
            <p className="text-muted-foreground">
              Nous sommes là pour vous aider avec tous vos problèmes et questions
            </p>
          </div>

          <Tabs defaultValue="ressources" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ressources">Ressources</TabsTrigger>
              <TabsTrigger value="contact">Contact direct</TabsTrigger>
              <TabsTrigger value="faq">FAQ rapide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ressources" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border/50 bg-card/50 backdrop-blur-md hover:shadow-xl transition-all">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <HelpCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Centre d'aide</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Documentation complète</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Accédez à notre base de connaissances complète avec des guides étape par étape et des tutoriels.</p>
                    <a href="#" className="text-accent hover:underline font-medium">Consulter le centre d'aide →</a>
                  </CardContent>
                </Card>
                
                <Card className="border border-border/50 bg-card/50 backdrop-blur-md hover:shadow-xl transition-all">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-accent/10 p-3 rounded-full">
                      <FileQuestion className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle>Questions fréquentes</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Réponses rapides</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Consultez notre page FAQ pour trouver rapidement des réponses aux questions les plus courantes.</p>
                    <a href="/faq" className="text-accent hover:underline font-medium">Voir les FAQs →</a>
                  </CardContent>
                </Card>
                
                <Card className="border border-border/50 bg-card/50 backdrop-blur-md hover:shadow-xl transition-all">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-green-500/10 p-3 rounded-full">
                      <BookOpen className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <CardTitle>Guides du joueur</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Conseils et stratégies</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Des guides approfondis pour vous aider à améliorer vos compétences et à comprendre les mécaniques de jeu.</p>
                    <a href="#" className="text-accent hover:underline font-medium">Explorer les guides →</a>
                  </CardContent>
                </Card>
                
                <Card className="border border-border/50 bg-card/50 backdrop-blur-md hover:shadow-xl transition-all">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-full">
                      <MessageSquare className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle>Communauté</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Forums de discussion</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Rejoignez notre communauté active pour discuter avec d'autres joueurs et obtenir de l'aide.</p>
                    <a href="#" className="text-accent hover:underline font-medium">Rejoindre la communauté →</a>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-6">
              <Card className="border border-border/50 bg-card/50 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-medium mb-4">Nous contacter</h3>
                      <p className="text-muted-foreground mb-6">Notre équipe de support est disponible pour vous aider avec toutes vos questions.</p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-card p-2 rounded-full border border-border">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Email</p>
                            <a href="mailto:support@smartsport.com" className="text-accent hover:underline">support@smartsport.com</a>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="bg-card p-2 rounded-full border border-border">
                            <PhoneCall className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Téléphone</p>
                            <a href="tel:+33123456789" className="text-accent hover:underline">+33 1 23 45 67 89</a>
                            <p className="text-xs text-muted-foreground mt-1">Lun-Ven, 9h-18h (CET)</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="bg-card p-2 rounded-full border border-border">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Chat en direct</p>
                            <a href="#" className="text-accent hover:underline">Démarrer une conversation</a>
                            <div className="flex items-center mt-1">
                              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-xs text-muted-foreground">En ligne</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <h3 className="text-xl font-medium mb-4">Temps de réponse typique</h3>
                      <div className="space-y-3 mb-6">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Email</span>
                            <span className="text-sm text-muted-foreground">24 heures</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full">
                            <div className="h-2 bg-accent rounded-full" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Téléphone</span>
                            <span className="text-sm text-muted-foreground">2-4 minutes</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full">
                            <div className="h-2 bg-accent rounded-full" style={{ width: '95%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Chat en direct</span>
                            <span className="text-sm text-muted-foreground">30 secondes</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full">
                            <div className="h-2 bg-accent rounded-full" style={{ width: '99%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <h4 className="font-medium mb-2">Statut du service</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-500">
                            Tournois: Opérationnel
                          </Badge>
                          <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-500">
                            Matchmaking: Opérationnel
                          </Badge>
                          <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-500">
                            Classements: Opérationnel
                          </Badge>
                          <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-500">
                            API: Opérationnel
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq">
              <Card className="border border-border/50 bg-card/50 backdrop-blur-md">
                <CardContent className="p-6">
                  <h3 className="text-xl font-medium mb-4">Questions fréquentes</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-border/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Comment puis-je réinitialiser mon mot de passe ?</h4>
                      <p className="text-muted-foreground">Allez sur la page de connexion et cliquez sur "Mot de passe oublié". Suivez les instructions envoyées à votre adresse e-mail pour créer un nouveau mot de passe.</p>
                    </div>
                    
                    <div className="border border-border/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Comment modifier mes informations de profil ?</h4>
                      <p className="text-muted-foreground">Après vous être connecté, cliquez sur votre avatar en haut à droite, puis sélectionnez "Paramètres" pour accéder aux options de modification de votre profil.</p>
                    </div>
                    
                    <div className="border border-border/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Comment signaler un problème technique ?</h4>
                      <p className="text-muted-foreground">Utilisez notre formulaire de contact en sélectionnant "Problème technique" dans la catégorie. Fournissez autant de détails que possible, y compris des captures d'écran si nécessaire.</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <a href="/faq" className="text-accent hover:underline font-medium">Voir toutes les questions fréquentes →</a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
