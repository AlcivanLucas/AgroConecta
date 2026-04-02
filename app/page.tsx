import Link from 'next/link'
import { 
  Tractor, 
  ClipboardList, 
  Stethoscope, 
  Leaf, 
  Truck, 
  Wrench,
  Users,
  Handshake,
  MapPin,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/src/components/layout/navbar'
import { Footer } from '@/src/components/layout/footer'

const stats = [
  { value: '5.000+', label: 'Produtores', icon: Users },
  { value: '2.500+', label: 'Prestadores', icon: Handshake },
  { value: '150+', label: 'Cidades', icon: MapPin },
]

const categories = [
  { 
    value: 'mecanizacao', 
    label: 'Mecanização', 
    icon: Tractor,
    description: 'Aluguel de tratores, colheitadeiras e implementos agrícolas'
  },
  { 
    value: 'consultoria', 
    label: 'Consultoria', 
    icon: ClipboardList,
    description: 'Consultoria em gestão rural, planejamento e produtividade'
  },
  { 
    value: 'veterinaria', 
    label: 'Veterinária', 
    icon: Stethoscope,
    description: 'Serviços veterinários para bovinos, equinos e aves'
  },
  { 
    value: 'agronomia', 
    label: 'Agronomia', 
    icon: Leaf,
    description: 'Assistência técnica em cultivo, solo e manejo de pragas'
  },
  { 
    value: 'transporte', 
    label: 'Transporte', 
    icon: Truck,
    description: 'Transporte de grãos, animais e insumos agrícolas'
  },
  { 
    value: 'manutencao', 
    label: 'Manutenção', 
    icon: Wrench,
    description: 'Manutenção de máquinas, equipamentos e instalações rurais'
  },
]

const profiles = [
  {
    id: 'produtor',
    title: 'Produtor Rural',
    description: 'Encontre prestadores de serviço qualificados para sua fazenda',
    benefits: [
      'Acesso a profissionais verificados',
      'Compare preços e avaliações',
      'Solicite orçamentos online',
      'Histórico de serviços contratados',
    ]
  },
  {
    id: 'prestador',
    title: 'Prestador de Serviços',
    description: 'Divulgue seus serviços e encontre novos clientes',
    benefits: [
      'Anuncie seus serviços gratuitamente',
      'Receba solicitações diretamente',
      'Aumente sua visibilidade no mercado',
      'Gerencie sua agenda de serviços',
    ]
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Conectando o <span className="text-primary">campo</span> ao <span className="text-primary">futuro</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground text-pretty">
                O AgroConecta é o marketplace que conecta produtores rurais a prestadores de serviços especializados no setor agropecuário.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/marketplace">
                    Explorar Serviços
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/cadastro">Cadastre-se Grátis</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="container mx-auto px-4 mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <Card key={stat.label} className="bg-card/50 backdrop-blur">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Categorias de Serviços</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Encontre o serviço ideal para sua necessidade
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.value} href={`/marketplace?category=${category.value}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold group-hover:text-primary transition-colors">
                        {category.label}
                      </h3>
                      <p className="mt-2 text-muted-foreground">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Profiles Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Como Funciona</h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Escolha seu perfil e comece a usar
              </p>
            </div>

            <Tabs defaultValue="produtor" className="max-w-3xl mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="produtor">Sou Produtor</TabsTrigger>
                <TabsTrigger value="prestador">Sou Prestador</TabsTrigger>
              </TabsList>
              {profiles.map((profile) => (
                <TabsContent key={profile.id} value={profile.id} className="mt-6">
                  <Card>
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold">{profile.title}</h3>
                      <p className="mt-2 text-muted-foreground">{profile.description}</p>
                      <ul className="mt-6 space-y-3">
                        {profile.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="mt-8 w-full" size="lg" asChild>
                        <Link href="/cadastro">
                          Criar Conta como {profile.title}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para começar?
            </h2>
            <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
              Junte-se a milhares de produtores e prestadores que já estão conectados através do AgroConecta.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/cadastro">Criar Conta Grátis</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
                <Link href="/marketplace">Ver Anúncios</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
