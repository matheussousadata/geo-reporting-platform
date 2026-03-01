# Geo Reporting Platform

> **Sistemas de Informação Geográfica (GIS) aplicados à gestão de infraestrutura urbana e cidadania participativa.**

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white" alt="Mapbox">
</p>

## 1. Escopo do Projeto
A **Geo Reporting Platform** é uma solução de engenharia frontend de alto desempenho projetada para centralizar e visualizar incidentes urbanos em tempo real. Utilizando tecnologias de mapeamento vetorial e arquitetura baseada em componentes, a plataforma transforma a interação cidadão-prefeitura em um fluxo de dados estruturado e georreferenciado.

O projeto demonstra competência em manipulação de APIs geográficas, gerenciamento de estado complexo e design responsivo focado em acessibilidade.

---

## 2. Arquitetura e Decisões Técnicas

A estrutura foi concebida sob os princípios de escalabilidade e separação de interesses (Separation of Concerns):

### 2.1. Engine de Mapeamento (Mapbox API)
Diferente de soluções simples, este projeto implementa o **Mapbox GL JS** para garantir renderização de mapas vetoriais em 60fps, permitindo interações fluidas, suporte a camadas de dados pesadas e visualização customizada de alta precisão.

### 2.2. Framework e Performance (Next.js 14+)
A escolha do **Next.js** permite a otimização de rotas e o uso de Server Components para garantir que o First Contentful Paint (FCP) seja mínimo, entregando uma aplicação rápida mesmo em dispositivos móveis com conexões limitadas.

### 2.3. Tipagem e Manutenibilidade
O projeto é 100% desenvolvido em **TypeScript**, utilizando interfaces rigorosas para garantir a integridade dos dados de geolocalização e as propriedades dos incidentes reportados.

---

## 3. Demonstração Visual

<p align="center">
  <img src="https://github.com/matheussousadata/geo-reporting-platform/blob/main/assets/tela.png">
</p>

---

## 4. Stack Tecnológica

| Camada | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **Core Framework** | Next.js | Estrutura de rotas e renderização otimizada. |
| **Linguagem** | TypeScript | Segurança de tipos e desenvolvimento escalável. |
| **Mapeamento** | Mapbox GL JS | Renderização vetorial e georreferenciamento. |
| **Estilização** | Tailwind CSS | Design System utilitário e responsividade. |
| **Ícones** | Lucide React | Conjunto de ícones vetoriais leves. |

---

## 5. Estrutura de Diretórios

A organização segue os padrões modernos de projetos Next.js:

* `src/app`: Gerenciamento de rotas e layouts da aplicação.
* `src/components`: Componentes de UI modulares e reutilizáveis.
* `src/hooks`: Lógica de estado e integração com a API do mapa.
* `src/utils`: Funções utilitárias e helpers de conversão geográfica.

---

## 6. Procedimento de Configuração Local

### Pré-requisitos
* Node.js v18.0 ou superior.
* Chave de acesso (Access Token) do Mapbox.

### Instalação e Execução
1. Clonagem do repositório:
```bash
git clone [https://github.com/matheussousadata/geo-reporting-platform.git](https://github.com/matheussousadata/geo-reporting-platform.git)
npm install
# Configure seu .env.local com o token do Mapbox
npm run dev
```

Matheus Sousa Frontend developer & AI engineering

