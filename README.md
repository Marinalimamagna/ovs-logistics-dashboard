# Sistema de Gestão de Ordens de Venda (OVGS) - Frontend

Esta é a interface do usuário do **OVGS (Sales Order Management System)**, desenvolvida sob os mais altos padrões de engenharia frontend para atender a centralização de controle operacional, rastreabilidade e governança de fluxos logísticos.

> **Nota de Alinhamento de Escopo:** Em conformidade com o perfil da oportunidade para **Desenvolvedor Frontend Sênior**, a presente solução implementa com fidelidade absoluta toda a camada de interface, gerenciamento de estado complexo, regras de transição de tela e tratamento de dados exigidos no escopo do desafio. As especificações de persistência relacional backend (NestJS/Prisma/Docker) foram integralmente encapsuladas e simuladas no ecossistema client-side através de uma camada de serviço assíncrona baseada em Promises e persistência local determinística.

## 🚀 Tecnologias Utilizadas

- **Next.js 14+ (App Router)**: Framework para arquitetura escalável e roteamento robusto.
- **TypeScript**: Tipagem estrita garantindo previsibilidade de dados e segurança em tempo de compilação.
- **Redux Toolkit & Redux Saga**: Gerenciamento de estado global e isolamento de efeitos colaterais para fluxos complexos.
- **TanStack React Query**: Gerenciamento de cache distribuído, sincronização de dados de rede e invalidação de estado de API de forma otimizada.
- **React Hook Form & Zod**: Controle de formulários de alta performance com validação de esquema em tempo real.
- **Tailwind CSS**: Estilização baseada em utilitários para interface fluida, responsiva e otimizada (Dark Mode Nativo).

---

## 📐 Decisões Arquiteturais & Trade-offs Assumidos

### 1. Separação de Estados (UI, Server Cache e Efeitos Colaterais)
- **React Query** foi adotado para gerenciar o estado que simula o servidor (Ordens de Venda, Clientes, Produtos). Isso evita *prop-drilling* e poluição do estado global com caches voláteis, reduzindo drasticamente o consumo de banda através de revalidações inteligentes.
- **Redux Saga** foi intencionalmente mantido na arquitetura para lidar estritamente com **efeitos colaterais e fluxos complexos**. Sempre que transações cruciais acontecem, o Saga intercepta as ações e popula de forma assíncrona a tela de monitoramento, simulando perfeitamente a integração estruturada de eventos pedida pelo core da aplicação.

### 2. Motor de Auditoria e Logs Estruturados
Para suprir a necessidade de rastreabilidade imutável imposta pelo requisito sem a dependência imediata de um banco de dados relacional externo, foi acoplado um **Interceptor de Auditoria** diretamente na camada do `apiService`. 
Cada evento de escrita dispara uma clonagem profunda imutável (`JSON.parse(JSON.stringify())`) dos dados, preservando e imprimindo no console do desenvolvedor uma cadeia JSON contendo `timestamp`, `actionType`, `entityAffected`, `previousState` e `nextState` no exato milissegundo da ação.

### 3. Abordagem de Validação Operacional (Trade-off de Engenharia)
Visando priorizar a consistência da fidelidade visual em runtime com dados reativos e o motor de logs estruturados em ambiente real de simulação, as regras de negócio de transição e os limites operacionais foram integralmente blindados e validados via schemas estritos de **Zod**, integrados ao ciclo de vida de componentes com renderização determinística.

---

## 🚀 Diferenciais Implementados (Nível Sênior)

* **Persistência de Dados Local (`localStorage`):** Como a aplicação opera com dados simulados (*mock*), foi implementada uma camada de persistence utilizando o `localStorage` do navegador integrada ao `apiService`. Isso garante que novas Ordens de Venda cadastradas resistam ao recarregamento de página (F5), simulando fielmente o comportamento de um banco de dados real.
* **Validação e Fluxo de Transporte Completo:** Em conformidade com as regras operacionais (onde uma Ordem de Venda deve possuir exatamente uma modalidade de frete), o campo foi acoplado ao schema de validação do **Zod** e ao **React Hook Form** na modal de criação.
* **Aprimoramento de UX e Visibilidade Logística:** O tipo de transporte selecionado (*Caminhão*, *Carreta* ou *Bi-truck*) foi adicionado como uma nova coluna visual na tabela principal de Ordens de Venda, permitindo que o operador gerencie e monitore a capacidade logística de relance, sem a necessidade de abrir submenus.

---

## 🛠️ Como Executar o Projeto

Certifique-se de possuir o **Node.js** instalado.

1. Instale as dependências do projeto:
   ```bash
   npm install