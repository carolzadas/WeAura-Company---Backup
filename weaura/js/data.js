(function () {
  "use strict";

  // Ordem = narrativa da página: o que fazemos → como → o que criamos → por quê → convite.
  var NAV_LINKS = [
    { href: "#servicos", label: "Serviços" },
    { href: "#processo", label: "Processo" },
    { href: "#projetos", label: "Projetos" },
    { href: "#essencia", label: "Essência" },
    { href: "#contato", label: "Contato" }
  ];

  // Seção Serviços: cada item tem um "preview" que se monta ao vivo no palco.
  // tone = cor da luz do palco (sage | terracotta | beige | all).
  var SERVICES = [
    {
      name: "Site Institucional",
      group: "Presença digital",
      tone: "sage",
      preview: "site",
      description: "Um site completo para apresentar sua empresa, seus serviços e sua história com profissionalismo."
    },
    {
      name: "Landing Page",
      group: "Presença digital",
      tone: "sage",
      preview: "landing",
      description: "Uma página focada em um único objetivo: converter visitantes em clientes ou leads."
    },
    {
      name: "One Page",
      group: "Presença digital",
      tone: "sage",
      preview: "onepage",
      description: "Um site enxuto, em uma única rolagem, ideal para apresentar seu negócio de forma direta."
    },
    {
      name: "Link na Bio personalizado",
      group: "Conexão direta",
      tone: "terracotta",
      preview: "bio",
      description: "Uma página com a cara da sua marca para centralizar seus links e redes sociais."
    },
    {
      name: "Portfólio",
      group: "Conexão direta",
      tone: "terracotta",
      preview: "portfolio",
      description: "Uma experiência visual para apresentar seu trabalho, valorizar seus projetos e mostrar o que torna sua marca única."
    },
    {
      name: "Catálogo Digital",
      group: "Conexão direta",
      tone: "terracotta",
      preview: "catalog",
      description: "Seus produtos ou serviços online, fáceis de navegar e de atualizar."
    },
    {
      name: "Manutenção e Atualizações",
      group: "Cuidado contínuo",
      tone: "beige",
      preview: "care",
      description: "Conteúdo, segurança e pequenas melhorias em dia, para o site nunca envelhecer."
    },
    {
      name: "Otimização de Performance",
      group: "Cuidado contínuo",
      tone: "beige",
      preview: "speed",
      description: "Ajustes técnicos para seu site carregar rápido e oferecer uma experiência fluida."
    },
    {
      name: "Presença Digital",
      group: "A solução completa",
      tone: "all",
      preview: "presence",
      description: "Tudo isso conectado: identidade, estratégia, páginas e cuidado trabalhando juntos pela sua marca."
    }
  ];

  var PROCESS_STEPS = [
    {
      number: "01",
      title: "Descoberta",
      description: "Antes de pensar em cores, páginas ou código, queremos entender o que existe por trás da sua marca. O que ela representa, para quem fala e onde quer chegar."
    },
    {
      number: "02",
      title: "Estratégia",
      description: "Transformamos descobertas em direção. Definimos a estrutura, a experiência e o caminho que sua marca vai percorrer no digital."
    },
    {
      number: "03",
      title: "Criação",
      description: "É quando a estratégia ganha forma. Transformamos ideias em design, linguagem e experiências que fazem sua marca ser percebida."
    },
    {
      number: "04",
      title: "Desenvolvimento",
      description: "É quando tudo ganha vida. Transformamos o design em uma experiência digital fluida, responsiva e pensada para funcionar de verdade."
    },
    {
      number: "05",
      title: "Entrega",
      description: "O projeto ganha o mundo. Colocamos sua marca no ar e seguimos de perto para que ela continue evoluindo."
    }
  ];

  // Projetos de exemplo — substitua pelos projetos reais do portfólio da WeAura Co.
  var PROJECTS = [
    {
      title: "Projeto exemplo — Site Institucional",
      category: "Site Institucional",
      description: "Substitua por um case real de site institucional do seu portfólio.",
      visualVariant: "site",
      hidden: true // oculto até existir um case real; apague esta linha para reexibir
    },
    {
      title: "Deputada Soraya Santos",
      link: "https://www.sorayasantos.com.br/",
      category: "Landing Page",
      description: "Uma experiência digital criada para apresentar a trajetória, atuação e principais informações da campanha eleitoral de Soraya Santos de forma clara e organizada.",
      visualVariant: "landing",
      image: "img/soraya-santos-mockup-card-v3.jpg"
    },
    {
      title: "Doutor Persiana",
      category: "One Page",
      link: "https://doutorpersiana.com.br/",
      description: "Uma presença digital pensada para transformar interesse em oportunidade, conectando a experiência do site a formulários estratégicos que qualificam os contatos e direcionam cada lead para o atendimento adequado.",
      visualVariant: "onepage",
      image: "img/doutor-persiana-mockup-card-v2.jpg"
    },
    {
      title: "Priscila Santos",
      category: "Link na Bio",
      description: "Uma página personalizada para reunir produtos, serviços, informações e formas de contato em um só lugar. Ideal para transformar o link da bio em uma experiência mais completa, organizada e profissional para quem chega pelo Instagram ou outras redes sociais.",
      visualVariant: "catalogo",
      message: 'Olá! Vi o projeto "Catálogo Digital - Link na Bio" da WeAura Co. e gostaria de conversar sobre o meu.',
      hidden: true // oculto por enquanto; apague esta linha para reexibir
    }
  ];

  window.WeAuraData = {
    NAV_LINKS: NAV_LINKS,
    SERVICES: SERVICES,
    PROCESS_STEPS: PROCESS_STEPS,
    PROJECTS: PROJECTS
  };
})();
