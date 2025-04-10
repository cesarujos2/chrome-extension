export async function customTefi(executionNumber: number = 0): Promise<void> {
    // Verifica si la URL actual corresponde al dominio esperado
    if (executionNumber > 10) return;
    if (!window.location.href.includes("dgprc.atm-erp.com")) return;

    // Variables de estilo base (modo oscuro inspirado en NextUI)
    const commonBg: string = "#000";            // Fondo oscuro
    const commonHoverBg: string = "#121212";         // Fondo en hover (ligeramente más claro)
    const textColor: string = "#ffffff";             // Texto blanco
    const textColorHard: string = "#F08377"
    const transitionTime: string = "all 0.4s ease";
    const borderRadius: string = "8px";

    // Función de acceso rápido al DOM con tipado
    const d = (selector: string): HTMLElement | null =>
        document.querySelector(selector);

    // Función para aplicar estilos y efectos hover
    const setBg = (
        element: HTMLElement | null,
        config: {
            bgColor?: string;
            bgColorHover?: string;
            color?: string;
            colorHover?: string;
            border?: string;
            borderRadius?: string;
        } = {}
    ): void => {
        if (!element) return;
        const {
            bgColor = commonBg,
            bgColorHover = commonBg,
            color = textColor,
            colorHover = textColorHard,
            border = "none",
            borderRadius: br = borderRadius
        } = config;
        element.style.backgroundColor = bgColor;
        element.style.color = color;
        element.style.border = border;
        element.style.borderRadius = br;
        element.style.outline = "none";
        element.style.boxShadow = "none";
        element.style.transition = transitionTime;
        element.onmouseover = () => {
            element.style.backgroundColor = bgColorHover;
            element.style.color = colorHover;
        };
        element.onmouseout = () => {
            element.style.backgroundColor = bgColor;
            element.style.color = color;
        };
    };

    // Personaliza el elemento de navegación
    const applyNavStyles = (): void => {

        const navElement: HTMLElement | null = d("nav");
        if (navElement) {
            navElement.style.backgroundColor = commonBg;
            navElement.style.backdropFilter = "blur(10px)";
            navElement.style.height = "80px";
            navElement.style.maxHeight = "80px";

            navElement.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
                setBg(button, {
                    bgColor: "transparent",
                    bgColorHover: "transparent",
                    color: textColor,
                    colorHover: textColorHard
                });
                button.style.borderRadius = borderRadius;
            });

            navElement.querySelector("ul.nav")?.querySelectorAll<HTMLLIElement>("li")?.forEach((li) => {
                setBg(li);
                li.style.fontSize = "1.2rem";
                li.style.padding = "0.5rem 1rem";
            });

            navElement.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
                setBg(a);
                a.style.padding = "0.5rem 1rem";
            });
            navElement.querySelectorAll<HTMLSpanElement>("span").forEach((span) => {
                setBg(span);
            });

            navElement.querySelectorAll<HTMLLIElement>(".dropdown-menu").forEach((li) => {
                li.style.padding = "0.5rem 1rem";
                li.style.marginTop = "0.5rem";
            })

            navElement.querySelectorAll<HTMLUListElement>("ul.dropdown-menu").forEach((ul) => {
                ul.style.padding = "5px"
                ul.style.backgroundColor = commonBg;
                ul.style.borderRadius = borderRadius;
                ul.style.border = "0.5px solid rgb(36, 36, 36)";
            })

            const inputs = Array.from(navElement.querySelectorAll<HTMLInputElement>("input"));
            const lastInput = inputs.at(-1);
            if (lastInput) {
                setBg(lastInput, { bgColor: commonBg, bgColorHover: commonBg });
            }
        }
    }
    const styleElement: HTMLStyleElement = document.createElement("style");
    styleElement.innerHTML = `
       * { scrollbar-width: thin; }

       #columnsFilterList .chooserContent .chooserList.green li {
        background-color: #1a2b27 !important;
       }
        #columnsFilterList .chooserContent .chooserList.red li {
        background-color: #41221f !important;
       }
        #buttontoggle{
            z-index: 999 !important;
        }

       .modal-content {
        background-color: ${commonBg} !important;
        color: #ffffff !important;
        border-radius: 8px !important;
        border: 0.5px solid rgb(36, 36, 36) !important;
        padding: 20px !important;
        }

        .modal-content h1,
        .modal-content h2,
        .modal-content h3,
        .modal-content h4,
        .modal-content h5,
        .modal-content h6 {
            color: #ffffff !important;
            font-weight: 600 !important;
        }

        .modal-content p,
        .modal-content li,
        .modal-content a {
            color: #ffffff !important;
            font-weight: 400 !important;
        }

        .modal-content label {
            color: #ffffff !important;
            font-weight: 500 !important;
        }

        .modal-content input,
        .modal-content select,
        .modal-content textarea {
            background-color: #232323 !important;
            color: #ffffff !important;
            border: 1px solid #333333 !important;
            border-radius: 4px !important;
            font-size: 14px !important;
            font-weight: 400 !important;
        }
        .tab-content{
            background-color: #333333 !important;
        }
        .tab-content .label{
            color: #ffffff !important;
            font-weight: 500 !important;
        }
        .tab-content .dateTime{
            background-color: #333333 !important;
        }

       .tab-content input,
        .tab-content select,
        .tab-content textarea,
        table.tabform input,
        table.tabform textarea,
        table.tabform select {
            background-color: #232323 !important;
            color: #ffffff !important;
            border: 1px solid #333333 !important;
            border-radius: 4px !important;
            font-size: 14px !important;
            font-weight: 400 !important;
        }

    table.list.view {
        background-color: ${commonBg} !important;
        color: #ffffff !important;
        border-collapse: collapse !important;
        width: 100% !important;
    }
    
    table.list.view th {
        background-color: ${commonBg} !important;
        padding: 10px !important;
        border: 0 !important;
        text-align: left !important;
    }
    
    table.list.view td {
        padding: 10px !important;
        border: 0 !important;
        color: #ffffff !important;
        background-color: transparent !important;
        font-weight: 400 !important;
        font-size: 14px !important;
    }
    
    table.list.view td.inlineEdit a {
        color: ${textColorHard} !important;
        font-weight: 500 !important;
        transition: all 0.3s ease !important;
        border-bottom-width: 0 !important;
        text-decoration: none !important;
    }
    
    table.list.view td a:hover {
        text-decoration: underline !important;
    }
    
    table.list.view tr {
        background-color: ${commonBg} !important;
        border-bottom: 1px solid #333333 !important;
    }
    
    table.list.view tr:hover {
        background-color: #333333 !important;
    }
    body {
        background-color: ${commonBg} !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
    }
    
    #bootstrap-container {
        margin-top: 80px !important;
        background-color: ${commonBg} !important;
        padding: 20px !important;
        font-family: inherit !important;
        color: ${textColor} !important;
        border-radius: ${borderRadius} !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        transition: all 0.3s ease-in-out;
    }
    
    #content {
        background-color: ${commonBg} !important;
        border-radius: ${borderRadius} !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        padding: 20px !important;
    }
    
    #content h1, #content h2, #content h3, #content h4, #content h5, #content h6 {
        color: ${textColor} !important;
        font-family: inherit !important;
        font-weight: 600 !important;
    }
    
    #sidebar_container .sidebar{
        background-color: ${commonBg} !important;
        padding-top: 20px !important;
        border: 0.5px solid rgb(36, 36, 36) !important;
        font-family: inherit !important;
        transition: all 0.3s ease-in-out;
    }
    
    #sidebar_container .sidebar li, 
    #sidebar_container .sidebar a {
       background-color: ${commonBg} !important;
       color: ${textColor} !important;
       border-radius: ${borderRadius} !important;
       transition: all 0.3s ease !important;
       outline: none !important;
       box-shadow: none !important;
    }
       #sidebar_container .sidebar li:hover, 
       #sidebar_container .sidebar a:hover {
       background-color: ${commonHoverBg} !important;
       color: ${textColorHard} !important;
       }
        #sidebar_container .sidebar li{
       font-family: inherit !important;
       font-size: 1.5rem !important;
       font-weight: 500 !important;
       padding: 0.5rem 1rem !important;
    }
    #buttontoggle{
        top: 92px !important;
    }
    .inlineEdit.detail-view-field, .detail-view-field{
           background-color: #232323!important;
           color: #fff !important;
    span#description_html{
    width: 100% !important;
    }
    span#description_html * {
    background-color: #232323 !important;
    color: #fff !important;
}

    `
    document.head.appendChild(styleElement);

    applyNavStyles();
    await new Promise(resolve => setTimeout(resolve, 50));
    customTefi(executionNumber++);

}
