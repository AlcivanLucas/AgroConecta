import Link from 'next/link'
import { Tractor, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Tractor className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">AgroConecta</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Conectamos produtores rurais e fazendeiros a prestadores de serviços especializados no setor agropecuário.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-muted-foreground hover:text-primary transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="text-muted-foreground hover:text-primary transition-colors">
                  Cadastre-se
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace?category=mecanizacao" className="text-muted-foreground hover:text-primary transition-colors">
                  Mecanização
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=consultoria" className="text-muted-foreground hover:text-primary transition-colors">
                  Consultoria
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=veterinaria" className="text-muted-foreground hover:text-primary transition-colors">
                  Veterinária
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=agronomia" className="text-muted-foreground hover:text-primary transition-colors">
                  Agronomia
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                contato@agroconecta.com.br
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                São Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AgroConecta. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary transition-colors">
              Termos de Uso
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
