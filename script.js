const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const menuLinks = document.querySelectorAll(".menu a");
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("section[id]");

const cartOpen = document.getElementById("cartOpen");
const cartOpenBottom = document.getElementById("cartOpenBottom");
const cartClose = document.getElementById("cartClose");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartDiscount = document.getElementById("cartDiscount");
const cartTotal = document.getElementById("cartTotal");
const couponInput = document.getElementById("couponInput");
const couponBtn = document.getElementById("couponBtn");
const cartFeedback = document.getElementById("cartFeedback");
const checkoutBtn = document.getElementById("checkoutBtn");
const unitSelect = document.getElementById("unitSelect");
const unitInfo = document.getElementById("unitInfo");
const dishesCards = document.querySelectorAll(".dish[data-units]");
const checkoutModal = document.getElementById("checkoutModal");
const modalClose = document.getElementById("modalClose");
const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
const paymentStatus = document.getElementById("paymentStatus");
const orderProgress = document.getElementById("orderProgress");
const seedsResult = document.getElementById("seedsResult");
const customerName = document.getElementById("customerName");
const customerEmail = document.getElementById("customerEmail");
const lgpdCheck = document.getElementById("lgpdCheck");
const lgpdMessage = document.getElementById("lgpdMessage");
const userChip = document.getElementById("userChip");
const userModal = document.getElementById("userModal");
const userModalClose = document.getElementById("userModalClose");
const modalCustomerName = document.getElementById("modalCustomerName");
const modalCustomerEmail = document.getElementById("modalCustomerEmail");
const modalLgpdCheck = document.getElementById("modalLgpdCheck");
const userModalFeedback = document.getElementById("userModalFeedback");
const saveUserBtn = document.getElementById("saveUserBtn");

let carrinho = [];
let cupomAplicado = false;
let sementesRaizes = 0;
let usuario = JSON.parse(localStorage.getItem("raizesUsuario")) || null;
let produtoPendente = null;

const moeda = (valor) => {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function atualizarUsuarioNaTela() {
  if (!usuario) {
    if (userChip) userChip.textContent = "Olá, visitante";
    return;
  }

  if (userChip) userChip.textContent = `Olá, ${usuario.nome.split(" ")[0]}`;

  if (customerName) customerName.value = usuario.nome;
  if (customerEmail) customerEmail.value = usuario.email;
  if (lgpdCheck) lgpdCheck.checked = true;
  if (lgpdMessage) lgpdMessage.textContent = "Consentimento registrado para esta simulação.";
}

function abrirModalUsuario(produto = null) {
  produtoPendente = produto;

  if (!userModal) return;

  userModal.classList.add("show");
  userModal.setAttribute("aria-hidden", "false");

  if (modalCustomerName && usuario) modalCustomerName.value = usuario.nome;
  if (modalCustomerEmail && usuario) modalCustomerEmail.value = usuario.email;
  if (modalLgpdCheck && usuario) modalLgpdCheck.checked = true;
  if (userModalFeedback) userModalFeedback.textContent = "";
}

function fecharModalUsuario() {
  if (!userModal) return;

  userModal.classList.remove("show");
  userModal.setAttribute("aria-hidden", "true");
}

function salvarUsuario() {
  const nome = modalCustomerName?.value.trim() || "";
  const email = modalCustomerEmail?.value.trim() || "";
  const aceitouLgpd = Boolean(modalLgpdCheck?.checked);

  if (!nome || !email) {
    userModalFeedback.textContent = "Preencha nome e e-mail para continuar.";
    return;
  }

  if (!emailValido(email)) {
    userModalFeedback.textContent = "Digite um e-mail válido.";
    return;
  }

  if (!aceitouLgpd) {
    userModalFeedback.textContent = "Para continuar, aceite a Política de Privacidade.";
    return;
  }

  usuario = { nome, email, lgpd: true };
  localStorage.setItem("raizesUsuario", JSON.stringify(usuario));
  atualizarUsuarioNaTela();
  fecharModalUsuario();

  if (produtoPendente) {
    adicionarAoCarrinho(produtoPendente.nome, produtoPendente.preco);
    produtoPendente = null;
  } else {
    abrirCarrinho();
  }
}


function atualizarCardapioPorUnidade() {
  if (!unitSelect || !unitInfo) return;

  const unidade = unitSelect.value;
  const nomeUnidade = unitSelect.options[unitSelect.selectedIndex].text;

  dishesCards.forEach((card) => {
    const unidades = card.dataset.units.split(",");
    card.classList.toggle("is-hidden", !unidades.includes(unidade));
  });

  unitInfo.textContent = `Cardápio carregado para ${nomeUnidade}.`;
}

if (unitSelect) {
  unitSelect.addEventListener("change", atualizarCardapioPorUnidade);
  atualizarCardapioPorUnidade();
}

function abrirPagamento() {
  if (!checkoutModal) return;

  checkoutModal.classList.add("show");
  checkoutModal.setAttribute("aria-hidden", "false");
  paymentStatus.textContent = "Aguardando confirmação do cliente.";
  orderProgress.classList.remove("show");
}

function fecharPagamento() {
  if (!checkoutModal) return;

  checkoutModal.classList.remove("show");
  checkoutModal.setAttribute("aria-hidden", "true");
}

if (menuBtn && menu) {
  menuBtn.addEventListener("click", () => {
    menu.classList.toggle("open");
    document.body.classList.toggle("menu-open");
  });
}

menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.12
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});

function marcarLinkAtivo() {
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 130;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");
    const link = document.querySelector(`.menu a[href="#${sectionId}"]`);

    if (!link) return;

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      menuLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", marcarLinkAtivo);
marcarLinkAtivo();

function abrirCarrinho() {
  if (!cartDrawer || !cartOverlay) return;

  cartDrawer.classList.add("open");
  cartOverlay.classList.add("show");
}

function fecharCarrinho() {
  if (!cartDrawer || !cartOverlay) return;

  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("show");
}

if (cartOpen) {
  cartOpen.addEventListener("click", () => {
    if (!usuario) {
      abrirModalUsuario();
      return;
    }

    abrirCarrinho();
  });
}

if (cartOpenBottom) {
  cartOpenBottom.addEventListener("click", () => {
    if (!usuario) {
      abrirModalUsuario();
      return;
    }

    abrirCarrinho();
  });
}

if (cartClose) {
  cartClose.addEventListener("click", fecharCarrinho);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", fecharCarrinho);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    fecharCarrinho();
    fecharPagamento();
    fecharModalUsuario();
  }
});

if (modalClose) {
  modalClose.addEventListener("click", fecharPagamento);
}

if (checkoutModal) {
  checkoutModal.addEventListener("click", (event) => {
    if (event.target === checkoutModal) {
      fecharPagamento();
    }
  });
}


if (userChip) {
  userChip.addEventListener("click", () => abrirModalUsuario());
}

if (userModalClose) {
  userModalClose.addEventListener("click", fecharModalUsuario);
}

if (userModal) {
  userModal.addEventListener("click", (event) => {
    if (event.target === userModal) {
      fecharModalUsuario();
    }
  });
}

if (saveUserBtn) {
  saveUserBtn.addEventListener("click", salvarUsuario);
}

if (modalCustomerName) {
  modalCustomerName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") salvarUsuario();
  });
}

if (modalCustomerEmail) {
  modalCustomerEmail.addEventListener("keydown", (event) => {
    if (event.key === "Enter") salvarUsuario();
  });
}

document.querySelectorAll(".add-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const nome = button.dataset.name;
    const preco = Number(button.dataset.price);

    if (!usuario) {
      abrirModalUsuario({ nome, preco });
      return;
    }

    adicionarAoCarrinho(nome, preco);
  });
});

function adicionarAoCarrinho(nome, preco) {
  const itemExistente = carrinho.find((item) => item.nome === nome);

  if (itemExistente) {
    itemExistente.qtd += 1;
  } else {
    carrinho.push({
      nome,
      preco,
      qtd: 1
    });
  }

  cartFeedback.textContent = `${nome} adicionado ao carrinho.`;

  renderizarCarrinho();
  abrirCarrinho();
}

function alterarQuantidade(nome, delta) {
  const item = carrinho.find((produto) => produto.nome === nome);

  if (!item) return;

  item.qtd += delta;

  if (item.qtd <= 0) {
    carrinho = carrinho.filter((produto) => produto.nome !== nome);
  }

  renderizarCarrinho();
}

function removerItem(nome) {
  carrinho = carrinho.filter((produto) => produto.nome !== nome);
  renderizarCarrinho();
}

function calcularResumo() {
  const subtotal = carrinho.reduce((soma, item) => {
    return soma + item.preco * item.qtd;
  }, 0);

  const desconto = cupomAplicado ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal - desconto);

  return { subtotal, desconto, total };
}

function renderizarCarrinho() {
  if (!cartItems || !cartCount || !cartSubtotal || !cartDiscount || !cartTotal) return;

  const quantidadeTotal = carrinho.reduce((soma, item) => soma + item.qtd, 0);

  cartCount.textContent = quantidadeTotal;

  if (!carrinho.length) {
    cartItems.innerHTML = `<p class="empty-cart">Seu carrinho está vazio.</p>`;
    cupomAplicado = false;

    if (couponInput) {
      couponInput.value = "";
    }
  } else {
    cartItems.innerHTML = carrinho.map((item) => {
      return `
        <article class="cart-item">
          <div>
            <h3>${item.nome}</h3>
            <p>${moeda(item.preco)} cada</p>

            <div class="qty-controls">
              <button type="button" data-action="minus" data-name="${item.nome}">-</button>
              <strong>${item.qtd}</strong>
              <button type="button" data-action="plus" data-name="${item.nome}">+</button>
            </div>

            <button class="remove-item" type="button" data-action="remove" data-name="${item.nome}">
              Remover
            </button>
          </div>

          <strong>${moeda(item.preco * item.qtd)}</strong>
        </article>
      `;
    }).join("");
  }

  const { subtotal, desconto, total } = calcularResumo();

  cartSubtotal.textContent = moeda(subtotal);
  cartDiscount.textContent = moeda(desconto);
  cartTotal.textContent = moeda(total);
}

if (cartItems) {
  cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const nome = button.dataset.name;
    const action = button.dataset.action;

    if (action === "plus") {
      alterarQuantidade(nome, 1);
    }

    if (action === "minus") {
      alterarQuantidade(nome, -1);
    }

    if (action === "remove") {
      removerItem(nome);
    }
  });
}

if (couponBtn) {
  couponBtn.addEventListener("click", () => {
    const cupom = couponInput.value.trim().toUpperCase();

    if (!carrinho.length) {
      cartFeedback.textContent = "Adicione um item antes de aplicar o cupom.";
      return;
    }

    if (cupom === "SERTAO10") {
      cupomAplicado = true;
      cartFeedback.textContent = "Cupom SERTAO10 aplicado: 10% de desconto.";
    } else {
      cupomAplicado = false;
      cartFeedback.textContent = "Cupom inválido. Tente SERTAO10.";
    }

    renderizarCarrinho();
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (!carrinho.length) {
      cartFeedback.textContent = "Seu carrinho está vazio.";
      return;
    }

    abrirPagamento();
  });
}

if (lgpdCheck) {
  lgpdCheck.addEventListener("change", () => {
    lgpdMessage.textContent = lgpdCheck.checked
      ? "Consentimento registrado para esta simulação."
      : "O aceite será validado no fechamento do pedido.";
  });
}

if (confirmPaymentBtn) {
  confirmPaymentBtn.addEventListener("click", () => {
    if (!carrinho.length) {
      paymentStatus.textContent = "Adicione produtos ao carrinho antes de finalizar.";
      return;
    }

    const nomeCliente = customerName.value.trim();
    const emailCliente = customerEmail.value.trim();

    if (!usuario && (!nomeCliente || !emailCliente)) {
      paymentStatus.textContent = "Preencha nome e e-mail antes de finalizar o pedido.";
      return;
    }

    if (emailCliente && !emailValido(emailCliente)) {
      paymentStatus.textContent = "Digite um e-mail válido antes de finalizar.";
      return;
    }

    if (!lgpdCheck.checked) {
      paymentStatus.textContent = "Para continuar, aceite a Política de Privacidade conforme a LGPD.";
      return;
    }

    if (nomeCliente && emailCliente) {
      usuario = { nome: nomeCliente, email: emailCliente, lgpd: true };
      localStorage.setItem("raizesUsuario", JSON.stringify(usuario));
      atualizarUsuarioNaTela();
    }

    const pagamento = document.querySelector('input[name="payment"]:checked')?.value || "Pix";
    const { total } = calcularResumo();
    const pontosGanhos = Math.floor(total);

    paymentStatus.textContent = `Enviando pagamento via ${pagamento} para o serviço externo...`;
    confirmPaymentBtn.disabled = true;

    setTimeout(() => {
      sementesRaizes += pontosGanhos;
      paymentStatus.textContent = "Pagamento aprovado. Pedido RN-1024 confirmado para retirada.";
      orderProgress.classList.add("show");
      seedsResult.textContent = `Você ganhou ${pontosGanhos} sementes. Total acumulado nesta simulação: ${sementesRaizes} sementes.`;
      cartFeedback.textContent = "Pedido confirmado. Acompanhe o status na tela de pagamento.";

      carrinho = [];
      cupomAplicado = false;
      renderizarCarrinho();
      confirmPaymentBtn.disabled = false;
    }, 1300);
  });
}

atualizarUsuarioNaTela();
renderizarCarrinho();