(function () {
  var paginas = [
    ["Inicio", "index.html", "Comunidad, eventos y oportunidades"],
    ["Eventos", "eventos.html", "NEA TECH y fotos del meetup"],
    ["Empleos", "empleos.html", "Bolsa de trabajo"],
    ["Primer trabajo", "primer-trabajo.html", "Checklist para buscar"],
    ["Vivir acá", "vivir.html", "Trabajar remoto desde Corrientes"],
    ["Dónde trabajar", "trabajar.html", "Cafés y coworkings"],
    ["Qué hacer", "que-hacer.html", "La ciudad cuando cerrás la laptop"],
    ["Empresas", "empresas.html", "Directorio del ecosistema"],
    ["Invertir", "invertir.html", "Traer un equipo a Corrientes"],
    ["Proyectos", "proyectos.html", "Lo que construye la comunidad"],
    ["Reglamento", "reglamento.html", "Código de conducta"],
    ["Prensa", "prensa.html", "Archivo de notas"]
  ];

  var barra = document.querySelector(".bar");
  var boton = document.querySelector(".menu-btn");
  function cerrarMenu() {
    if (!barra || !barra.classList.contains("abierto")) return;
    barra.classList.remove("abierto");
    boton.setAttribute("aria-expanded", "false");
  }
  if (boton && barra) {
    boton.addEventListener("click", function () {
      var abierto = barra.classList.toggle("abierto");
      boton.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
    barra.querySelectorAll("nav a").forEach(function (vinculo) {
      vinculo.addEventListener("click", cerrarMenu);
    });
    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && barra.classList.contains("abierto")) {
        cerrarMenu();
        boton.focus();
      }
    });
  }

  var aca = location.pathname.split("/").pop() || "index.html";
  if (aca === "") aca = "index.html";
  document.querySelectorAll(".bar a").forEach(function (vinculo) {
    var href = (vinculo.getAttribute("href") || "").split("#")[0];
    if (href === aca) vinculo.setAttribute("aria-current", "true");
  });

  var capa = document.createElement("div");
  capa.className = "paleta";
  capa.hidden = true;
  capa.innerHTML = '<div class="paleta-caja" role="dialog" aria-modal="true" aria-label="Buscar en el sitio"><input class="paleta-input" type="search" placeholder="Buscar páginas" aria-label="Buscar páginas"><ul class="paleta-lista"></ul></div>';
  document.body.appendChild(capa);
  var campo = capa.querySelector("input");
  var lista = capa.querySelector("ul");

  function dibujar(q) {
    var texto = (q || "").trim().toLowerCase();
    var items = paginas.filter(function (item) {
      return !texto || (item[0] + " " + item[2]).toLowerCase().indexOf(texto) !== -1;
    });
    lista.innerHTML = "";
    items.forEach(function (item, i) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = item[1];
      a.innerHTML = "<strong></strong><span></span>";
      a.querySelector("strong").textContent = item[0];
      a.querySelector("span").textContent = item[2];
      if (i === 0) a.dataset.activa = "true";
      li.appendChild(a);
      lista.appendChild(li);
    });
    if (!items.length) {
      var vacio = document.createElement("li");
      vacio.className = "paleta-vacio";
      vacio.textContent = "Nada con ese nombre.";
      lista.appendChild(vacio);
    }
  }

  function abrir() {
    capa.hidden = false;
    dibujar("");
    campo.value = "";
    campo.focus();
  }
  function cerrar() {
    capa.hidden = true;
  }

  document.querySelectorAll("[data-buscar]").forEach(function (el) {
    el.addEventListener("click", abrir);
  });
  capa.addEventListener("click", function (evento) {
    if (evento.target === capa) cerrar();
  });
  campo.addEventListener("input", function () { dibujar(campo.value); });
  document.addEventListener("keydown", function (evento) {
    var meta = evento.metaKey || evento.ctrlKey;
    if (meta && evento.key.toLowerCase() === "k") {
      evento.preventDefault();
      capa.hidden ? abrir() : cerrar();
    }
    if (evento.key === "Escape") cerrar();
    if (!capa.hidden && evento.key === "Enter") {
      var primero = lista.querySelector("a");
      if (primero) location.href = primero.href;
    }
  });

  function leer(clave) {
    try { return JSON.parse(localStorage.getItem(clave) || "[]"); }
    catch (e) { return []; }
  }
  function guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }

  function mail(asunto, cuerpo) {
    location.href = "mailto:tinsaurralde17@gmail.com?subject=" + encodeURIComponent(asunto) + "&body=" + encodeURIComponent(cuerpo);
  }

  var bolsa = document.querySelector("[data-bolsa]");
  if (bolsa) {
    var listaBolsa = bolsa.querySelector(".bolsa-lista");
    var vacioBolsa = bolsa.querySelector(".bolsa-vacia");
    function pintarBolsa() {
      var avisos = leer("ctes-bolsa");
      listaBolsa.innerHTML = "";
      vacioBolsa.hidden = avisos.length > 0;
      avisos.forEach(function (aviso) {
        var art = document.createElement("article");
        art.className = "aviso";
        art.innerHTML = "<p class='kicker'></p><h3></h3><p></p><p class='fine'></p><a class='btn' target='_blank' rel='noopener'>Postularme</a> <button type='button' class='btn ghost'>Quitar de este navegador</button>";
        art.querySelector(".kicker").textContent = aviso.modo;
        art.querySelector("h3").textContent = aviso.puesto + " · " + aviso.equipo;
        art.querySelector("p").textContent = aviso.detalle;
        art.querySelector(".fine").textContent = "Borrador guardado en este navegador.";
        art.querySelector("a").href = aviso.enlace;
        art.querySelector("button").addEventListener("click", function () {
          guardar("ctes-bolsa", leer("ctes-bolsa").filter(function (item) { return item.id !== aviso.id; }));
          pintarBolsa();
        });
        listaBolsa.appendChild(art);
      });
    }
    bolsa.querySelector("form").addEventListener("submit", function (evento) {
      evento.preventDefault();
      var datos = new FormData(evento.target);
      var aviso = {
        id: String(Date.now()),
        puesto: String(datos.get("puesto") || "").trim(),
        equipo: String(datos.get("equipo") || "").trim(),
        modo: String(datos.get("modo") || ""),
        enlace: String(datos.get("enlace") || "").trim(),
        detalle: String(datos.get("detalle") || "").trim()
      };
      if (!aviso.puesto || !aviso.equipo || !aviso.enlace) return;
      var avisos = leer("ctes-bolsa");
      avisos.unshift(aviso);
      guardar("ctes-bolsa", avisos);
      pintarBolsa();
      evento.target.reset();
      mail("Búsqueda para corrientes.dev", aviso.puesto + "\n" + aviso.equipo + "\n" + aviso.modo + "\n" + aviso.enlace + "\n\n" + aviso.detalle);
    });
    pintarBolsa();
  }

  document.querySelectorAll("[data-lista]").forEach(function (bloque) {
    var clave = "ctes-" + bloque.dataset.lista;
    var formLista = bloque.querySelector("form");
    var ul = bloque.querySelector("ul");
    function pintar() {
      ul.innerHTML = "";
      leer(clave).forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item.titulo;
        if (item.detalle) {
          var p = document.createElement("p");
          p.textContent = item.detalle;
          li.appendChild(p);
        }
        ul.appendChild(li);
      });
    }
    formLista.addEventListener("submit", function (evento) {
      evento.preventDefault();
      var datos = new FormData(formLista);
      var item = {
        titulo: String(datos.get("titulo") || "").trim(),
        detalle: String(datos.get("detalle") || "").trim()
      };
      if (!item.titulo) return;
      var items = leer(clave);
      items.unshift(item);
      guardar(clave, items);
      pintar();
      formLista.reset();
      mail(bloque.dataset.asunto || "Aporte a corrientes.dev", item.titulo + "\n" + item.detalle);
    });
    pintar();
  });

  document.querySelectorAll("[data-checks]").forEach(function (formChecks) {
    var clave = "ctes-checks";
    var estado = {};
    try { estado = JSON.parse(localStorage.getItem(clave) || "{}"); } catch (e) { estado = {}; }
    formChecks.querySelectorAll("input[type=checkbox]").forEach(function (caja) {
      if (estado[caja.name]) caja.checked = true;
      caja.addEventListener("change", function () {
        estado[caja.name] = caja.checked;
        localStorage.setItem(clave, JSON.stringify(estado));
      });
    });
  });

  document.querySelectorAll("[data-tira]").forEach(function (tira) {
    var pista = tira.querySelector(".galeria");
    function paso() {
      var foto = pista.querySelector("li");
      return foto ? foto.getBoundingClientRect().width + 10 : 260;
    }
    tira.querySelector(".prev").addEventListener("click", function () {
      pista.scrollBy({ left: -paso() * 2, behavior: "smooth" });
    });
    tira.querySelector(".next").addEventListener("click", function () {
      pista.scrollBy({ left: paso() * 2, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-recap]").forEach(function (recap) {
    var video = recap.querySelector("video");
    var play = recap.querySelector(".recap-play");
    var duracion = recap.querySelector("[data-duracion]");
    if (!video || !play) return;
    video.controls = false;
    play.hidden = false;
    recap.classList.add("portada");
    play.addEventListener("click", function () {
      recap.classList.remove("portada");
      video.controls = true;
      video.play();
      video.focus();
      setTimeout(function () { play.hidden = true; }, 450);
    });
    function medir() {
      if (!duracion || !isFinite(video.duration)) return;
      var s = Math.round(video.duration);
      var texto = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
      duracion.textContent = texto;
      play.setAttribute("aria-label", "Reproducir el recap del encuentro, " + texto);
    }
    if (video.readyState >= 1) medir();
    else video.addEventListener("loadedmetadata", medir);
  });

  var novedades = document.querySelector("[data-novedades]");
  if (novedades) {
    novedades.addEventListener("submit", function (evento) {
      evento.preventDefault();
      var correo = new FormData(novedades).get("correo");
      if (!correo) return;
      mail("Novedades de corrientes.dev", "Quiero recibir novedades en " + correo);
    });
  }
})();
