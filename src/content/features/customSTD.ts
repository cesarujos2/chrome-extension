export async function customSTD() {
    if (!window.location.href.includes("https://std.mtc.gob.pe/")) return;

    document.querySelectorAll("*").forEach((el) => {
        if (!(el instanceof HTMLElement)) return; // Verificar que es un elemento HTML

        const computedStyle = window.getComputedStyle(el);

        if (computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)") {
            el.style.backgroundColor = "black";
        }
        if (computedStyle.color !== "rgba(0, 0, 0, 0)") {
            el.style.color = "white";
        }

        if (computedStyle.borderColor && computedStyle.borderColor !== "rgba(0, 0, 0, 0)") {
            el.style.borderColor = "#2B2B2B";
        }

    });

}