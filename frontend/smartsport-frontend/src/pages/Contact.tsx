
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Mail, MessageSquare, MapPin, Send, GripHorizontal } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
  subject: z.string().min(5, { message: "Le sujet doit contenir au moins 5 caractères" }),
  category: z.string().min(1, { message: "Veuillez sélectionner une catégorie" }),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères" }),
});

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      category: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Simuler un appel API
    setTimeout(() => {
      console.log(values);
      setIsSubmitting(false);
      form.reset();
      
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les meilleurs délais.",
      });
    }, 1500);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Contactez-nous</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une question, une suggestion ou un problème ? Notre équipe est là pour vous aider.
              Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border border-border/50 bg-card/50 backdrop-blur-md shadow-xl">
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre nom" {...field} />
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
                                <Input type="email" placeholder="votre@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sujet</FormLabel>
                              <FormControl>
                                <Input placeholder="Sujet de votre message" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Catégorie</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une catégorie" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="support">Support technique</SelectItem>
                                  <SelectItem value="billing">Facturation</SelectItem>
                                  <SelectItem value="feedback">Commentaires & Suggestions</SelectItem>
                                  <SelectItem value="partnership">Partenariats</SelectItem>
                                  <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Détaillez votre demande ici..." 
                                className="resize-none min-h-[150px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="esports-gradient shadow-lg shadow-esports-purple/20"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <GripHorizontal className="mr-2 h-4 w-4 animate-spin" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Envoyer le message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="border border-border/50 bg-card/50 backdrop-blur-md shadow-xl mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Nous contacter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Support technique</h4>
                    <a href="mailto:support@smartsport.com" className="text-accent hover:underline block">
                      support@smartsport.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Réponse sous 24 heures
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Partenariats</h4>
                    <a href="mailto:partnerships@smartsport.com" className="text-accent hover:underline block">
                      partnerships@smartsport.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pour les collaborations et opportunités business
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Presse</h4>
                    <a href="mailto:press@smartsport.com" className="text-accent hover:underline block">
                      press@smartsport.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pour les demandes de presse et médias
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-border/50 bg-card/50 backdrop-blur-md shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    SmartSport SAS<br />
                    123 Avenue de l'E-Sport<br />
                    75001 Paris, France
                  </p>
                  
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.142047744348!2d2.3354233157285967!3d48.87456397928991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e3878d4b433%3A0x13a0b0e31e41444!2s75001%20Paris!5e0!3m2!1sfr!2sfr!4v1617730006298!5m2!1sfr!2sfr" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }}
                      allowFullScreen={true} 
                      loading="lazy"
                      title="Carte"
                    ></iframe>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Horaires d'ouverture</h4>
                    <p className="text-sm text-muted-foreground">
                      Lundi - Vendredi: 9h00 - 18h00<br />
                      Samedi - Dimanche: Fermé
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-8 text-center">Questions fréquemment posées</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Comment réinitialiser mon mot de passe ?
                </h3>
                <p className="text-muted-foreground">
                  Vous pouvez réinitialiser votre mot de passe en cliquant sur "Mot de passe oublié" sur la page de connexion.
                </p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Comment s'inscrire à un tournoi ?
                </h3>
                <p className="text-muted-foreground">
                  Rendez-vous sur la page du tournoi qui vous intéresse et cliquez sur le bouton "S'inscrire".
                </p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Je n'ai pas reçu mon prix, que faire ?
                </h3>
                <p className="text-muted-foreground">
                  Contactez notre équipe de support avec les détails du tournoi et nous résoudrons ce problème rapidement.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <a href="/faq" className="text-accent hover:underline font-medium">
                Voir toutes les questions fréquentes →
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
