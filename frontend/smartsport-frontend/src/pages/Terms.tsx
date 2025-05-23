
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CheckCircle, Shield } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6 text-accent" />
              <h1 className="text-3xl font-bold tracking-tight">Conditions d'utilisation</h1>
            </div>
            <p className="text-muted-foreground">
              Dernière mise à jour : 4 avril 2025
            </p>
          </div>

          <Card className="border border-border/50 bg-card/50 backdrop-blur-md shadow-xl mb-8">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">1. Acceptation des conditions</h2>
                  <p className="text-muted-foreground">
                    En accédant ou en utilisant la plateforme SmartSport, vous acceptez d'être lié par ces Conditions d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser notre service.
                  </p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">2. Modification des conditions</h2>
                  <p className="text-muted-foreground">
                    Nous nous réservons le droit de modifier ces conditions à tout moment. Toute modification prendra effet immédiatement après sa publication sur la plateforme. Votre utilisation continue de la plateforme après la publication de modifications constitue votre acceptation de ces modifications.
                  </p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">3. Description du service</h2>
                  <p className="text-muted-foreground mb-4">
                    SmartSport est une plateforme en ligne permettant aux utilisateurs de participer à des tournois e-sport, de suivre leurs statistiques et de se connecter avec d'autres joueurs. Nous proposons différentes fonctionnalités, notamment :
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Création et participation à des tournois e-sport</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Suivi de statistiques et de performances</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Système de classement et de récompenses</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Fonctionnalités communautaires et sociales</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">4. Inscription et compte</h2>
                  <p className="text-muted-foreground mb-4">
                    Pour utiliser certaines fonctionnalités de SmartSport, vous devez créer un compte. Vous êtes responsable de :
                  </p>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                    <li>Fournir des informations exactes, à jour et complètes lors de l'inscription</li>
                    <li>Maintenir la confidentialité de votre mot de passe et de vos informations de compte</li>
                    <li>Toutes les activités qui se produisent sous votre compte</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Nous nous réservons le droit de désactiver tout compte utilisateur à notre seule discrétion, notamment si nous estimons que vous avez enfreint ces conditions.
                  </p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">5. Contenu et conduite de l'utilisateur</h2>
                  <p className="text-muted-foreground mb-4">
                    En publiant du contenu sur notre plateforme, vous accordez à SmartSport une licence mondiale, non exclusive, libre de redevance, pour utiliser, modifier, afficher et distribuer ce contenu. Vous acceptez de ne pas :
                  </p>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                    <li>Publier du contenu illégal, offensant, menaçant, diffamatoire, obscène ou autrement répréhensible</li>
                    <li>Usurper l'identité d'une personne ou d'une entité</li>
                    <li>Utiliser notre service pour des activités commerciales non autorisées</li>
                    <li>Interférer avec ou perturber nos services ou serveurs</li>
                    <li>Tenter de contourner les mesures de sécurité ou d'accéder à des parties non publiques de la plateforme</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">6. Propriété intellectuelle</h2>
                  <p className="text-muted-foreground">
                    Le service et son contenu original, ses fonctionnalités et sa conception sont la propriété exclusive de SmartSport et sont protégés par des lois internationales sur le droit d'auteur, les marques de commerce, les brevets, les secrets commerciaux et autres lois sur la propriété intellectuelle ou les droits de propriété.
                  </p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">7. Résiliation</h2>
                  <p className="text-muted-foreground">
                    Nous nous réservons le droit de mettre fin à votre accès à notre service, sans préavis, pour toute raison, y compris, sans limitation, une violation des présentes conditions. Toutes les dispositions des présentes conditions qui, par leur nature, devraient survivre à la résiliation, survivront à la résiliation.
                  </p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">8. Limitation de responsabilité</h2>
                  <p className="text-muted-foreground">
                    En aucun cas, SmartSport, ses dirigeants, administrateurs, employés, agents, ne seront responsables de tout dommage direct, indirect, accessoire, spécial, consécutif ou exemplaire, y compris, mais sans s'y limiter, la perte de profits, de données, d'utilisation, de clientèle, ou d'autres pertes intangibles, résultant de votre accès à ou de votre utilisation de notre service.
                  </p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">9. Droit applicable</h2>
                  <p className="text-muted-foreground">
                    Ces conditions sont régies et interprétées conformément aux lois françaises, sans égard aux principes de conflits de lois. Notre incapacité à faire respecter un droit ou une disposition de ces conditions ne sera pas considérée comme une renonciation à ces droits.
                  </p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">10. Contact</h2>
                  <p className="text-muted-foreground">
                    Si vous avez des questions concernant ces conditions, veuillez nous contacter à <a href="mailto:legal@smartsport.com" className="text-accent hover:underline">legal@smartsport.com</a>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <p className="text-muted-foreground">
              Ces conditions constituent l'intégralité de l'accord entre vous et SmartSport concernant notre service, et remplacent tout accord antérieur que vous pourriez avoir avec nous concernant le service.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
