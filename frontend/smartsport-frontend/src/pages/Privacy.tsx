
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Lock, Eye, Database, Globe, Shield, Bell } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="h-6 w-6 text-accent" />
              <h1 className="text-3xl font-bold tracking-tight">Politique de confidentialité</h1>
            </div>
            <p className="text-muted-foreground">
              Dernière mise à jour : 4 avril 2025
            </p>
          </div>

          <div className="mb-8">
            <p className="text-muted-foreground">
              La protection de vos données personnelles est importante pour nous. Cette Politique de confidentialité explique comment SmartSport collecte, utilise et protège vos informations lorsque vous utilisez notre plateforme.
            </p>
          </div>

          <Tabs defaultValue="collecte" className="mb-10">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="collecte" className="flex items-center">
                <Database className="h-4 w-4 mr-2" /> Collecte
              </TabsTrigger>
              <TabsTrigger value="utilisation" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" /> Utilisation
              </TabsTrigger>
              <TabsTrigger value="protection" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" /> Protection
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="collecte" className="mt-6">
              <Card className="border border-border/50 bg-card/50 backdrop-blur-md shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Collecte des informations</h2>
                  <p className="text-muted-foreground mb-6">
                    Nous collectons différents types d'informations pour fournir et améliorer nos services.
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Informations que vous nous fournissez</h3>
                      <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                        <li>Informations de compte (nom, adresse e-mail, mot de passe)</li>
                        <li>Informations de profil (pseudo, avatar, biographie)</li>
                        <li>Informations de paiement (pour les achats ou les inscriptions aux tournois payants)</li>
                        <li>Communications (messages, commentaires, évaluations)</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Informations collectées automatiquement</h3>
                      <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                        <li>Données d'utilisation (pages visitées, fonctionnalités utilisées, temps passé)</li>
                        <li>Informations sur l'appareil (type d'appareil, système d'exploitation, navigateur)</li>
                        <li>Données de localisation (pays, région, basées sur votre adresse IP)</li>
                        <li>Cookies et technologies similaires</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Informations provenant de tiers</h3>
                      <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                        <li>Informations de réseaux sociaux (si vous vous connectez via un réseau social)</li>
                        <li>Données de jeux (si vous connectez vos comptes de jeux)</li>
                        <li>Informations de partenaires (organisateurs de tournois, sponsors)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="utilisation" className="mt-6">
              <Card className="border border-border/50 bg-card/50 backdrop-blur-md shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Utilisation des informations</h2>
                  <p className="text-muted-foreground mb-6">
                    Nous utilisons vos informations personnelles aux fins suivantes :
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Fourniture et amélioration des services</h3>
                      <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                        <li>Créer et gérer votre compte</li>
                        <li>Personnaliser votre expérience</li>
                        <li>Faciliter votre participation aux tournois</li>
                        <li>Développer et améliorer nos services</li>
                        <li>Analyser l'utilisation de notre plateforme</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Communications</h3>
                      <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                        <li>Vous envoyer des informations sur les tournois auxquels vous êtes inscrits</li>
                        <li>Vous informer des mises à jour importantes de notre service</li>
                        <li>Vous envoyer des notifications concernant votre compte</li>
                        <li>Répondre à vos demandes et questions</li>
                        <li>Vous envoyer des communications marketing (avec votre consentement)</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Sécurité et conformité légale</h3>
                      <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                        <li>Protéger nos services contre les activités frauduleuses ou abusives</li>
                        <li>Résoudre les litiges et faire respecter nos conditions</li>
                        <li>Se conformer aux obligations légales</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="protection" className="mt-6">
              <Card className="border border-border/50 bg-card/50 backdrop-blur-md shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Protection des données</h2>
                  <p className="text-muted-foreground mb-6">
                    Nous prenons très au sérieux la protection de vos données personnelles et mettons en œuvre diverses mesures pour assurer leur sécurité.
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Mesures de sécurité</h3>
                      <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                        <li>Chiffrement des données sensibles</li>
                        <li>Accès restreint aux données personnelles</li>
                        <li>Systèmes de protection contre les intrusions</li>
                        <li>Audits de sécurité réguliers</li>
                        <li>Formation de notre personnel en matière de protection des données</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Conservation des données</h3>
                      <p className="text-muted-foreground mb-4">
                        Nous conservons vos données personnelles aussi longtemps que nécessaire pour :
                      </p>
                      <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                        <li>Fournir nos services</li>
                        <li>Respecter nos obligations légales</li>
                        <li>Résoudre les litiges</li>
                        <li>Faire respecter nos accords</li>
                      </ul>
                      <p className="text-muted-foreground mt-4">
                        Lorsque vos données ne sont plus nécessaires à ces fins, nous les supprimons ou les anonymisons.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Transferts internationaux</h3>
                      <p className="text-muted-foreground">
                        Vos informations peuvent être transférées et traitées dans des pays autres que celui où vous résidez. Ces pays peuvent avoir des lois sur la protection des données différentes de celles de votre pays. Nous prenons des mesures pour garantir que vos données bénéficient d'un niveau de protection adéquat, quel que soit l'endroit où elles sont traitées.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border border-border/50 bg-card/50 backdrop-blur-md shadow-xl mb-8">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-primary" />
                    Partage des informations
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Nous ne vendons pas vos informations personnelles. Nous partageons vos informations uniquement dans les circonstances suivantes :
                  </p>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                    <li>Avec votre consentement</li>
                    <li>Avec nos fournisseurs de services qui nous aident à exploiter notre plateforme</li>
                    <li>Pour des raisons légales (conformité à la loi, protection de nos droits)</li>
                    <li>Dans le cadre d'une fusion, acquisition ou vente d'actifs</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-primary" />
                    Vos choix et vos droits
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Vous disposez de plusieurs droits concernant vos données personnelles :
                  </p>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                    <li>Accéder à vos données personnelles</li>
                    <li>Rectifier vos données inexactes ou incomplètes</li>
                    <li>Supprimer vos données (dans certaines circonstances)</li>
                    <li>Limiter le traitement de vos données</li>
                    <li>Demander la portabilité de vos données</li>
                    <li>S'opposer au traitement de vos données</li>
                    <li>Retirer votre consentement à tout moment</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@smartsport.com" className="text-accent hover:underline">privacy@smartsport.com</a>.
                  </p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">Modifications de cette politique</h2>
                  <p className="text-muted-foreground">
                    Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. La version la plus récente sera toujours publiée sur cette page avec la date de dernière mise à jour. Nous vous encourageons à consulter régulièrement cette page pour rester informé de tout changement.
                  </p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">Contact</h2>
                  <p className="text-muted-foreground">
                    Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques en matière de données, veuillez nous contacter à <a href="mailto:privacy@smartsport.com" className="text-accent hover:underline">privacy@smartsport.com</a> ou à l'adresse suivante :<br /><br />
                    SmartSport SAS<br />
                    Responsable de la protection des données<br />
                    123 Avenue de l'E-Sport<br />
                    75001 Paris, France
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="text-muted-foreground">
              Pour toute préoccupation concernant vos données personnelles, vous avez également le droit de déposer une plainte auprès de l'autorité de protection des données de votre pays.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
