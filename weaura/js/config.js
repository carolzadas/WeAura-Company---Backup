(function () {
  "use strict";

  // TODO: substitua pelo número real de WhatsApp da WeAura Co (formato internacional, só dígitos).
  var WHATSAPP_NUMBER = "5500000000000";

  function getWhatsAppLink(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message || "");
  }

  function projectMessage(title) {
    return 'Olá! Vi o projeto "' + title + '" da WeAura Co e gostaria de conversar sobre o meu.';
  }

  window.WeAuraConfig = {
    getWhatsAppLink: getWhatsAppLink,
    projectMessage: projectMessage,
    WHATSAPP_MESSAGES: {
      default: "Olá! Gostaria de conversar sobre um projeto com a WeAura Co."
    }
  };
})();
