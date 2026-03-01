# 🌍 Geo Reporting Platform

> **Plataforma de geolocalização para cidadania ativa e monitoramento urbano.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

O **Geo Reporting Platform** é uma interface moderna desenvolvida para conectar cidadãos à gestão pública. Através de um mapa interativo, usuários podem reportar incidentes, buracos, falta de iluminação ou problemas de saneamento, facilitando a visualização crítica dos pontos que necessitam de intervenção imediata da prefeitura.

---

## 🚀 Demonstração

[Link para o Projeto Online](https://seu-link-aqui.vercel.app)

![Screenshot da Aplicação](https://via.placeholder.com/800x450.png?text=Coloque+aqui+um+Print+do+seu+Mapa+Interativo)

---

## 🎯 Objetivo do Projeto

Este projeto foi idealizado para demonstrar o domínio de tecnologias modernas de Frontend e a capacidade de transformar dados geográficos em uma interface intuitiva e funcional. 

### Principais problemas resolvidos:
- **Dificuldade de Comunicação:** Centraliza as reclamações em um único canal visual.
- **Transparência:** Permite que outros cidadãos vejam o que já foi reportado.
- **Engajamento:** Interface lúdica e rápida que incentiva a participação popular.

---

## ✨ Diferenciais Técnicos (Frontend Focus)

Para este projeto, foquei em padrões de desenvolvimento que garantem escalabilidade:

- **📍 Integração de Mapas:** Implementação de camadas interativas utilizando [Leaflet.js / Google Maps API].
- **🧩 Componentização Atômica:** Interface dividida em componentes pequenos, reutilizáveis e fáceis de testar.
- **📱 Mobile First:** Experiência totalmente responsiva, pensada para o cidadão que está na rua com o celular na mão.
- **⚡ Gerenciamento de Estado:** Uso de [Context API / Zustand] para lidar com os dados das denúncias de forma fluida.
- **🎨 UI/UX:** Design limpo com foco em acessibilidade e contraste.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| --- | --- |
| **Framework** | React.js (Vite) |
| **Estilização** | Tailwind CSS / Headless UI |
| **Ícones** | Lucide React |
| **Mapas** | Leaflet / React-Leaflet |
| **Validação** | Zod & React Hook Form |

---

## 📂 Estrutura de Arquivos

```text
src/
 ├── assets/       # Ícones e Imagens Estáticas
 ├── components/   # UI Kit (Button, Input, Card, Modal)
 ├── hooks/        # Lógica de Geolocalização e Fetching
 ├── pages/        # Telas da Aplicação (Home, Dashboard, Report)
 ├── services/     # Integração com APIs externas
 └── styles/       # Configurações globais de tema
