export function getBoss(): string | null {
    const bannerTop = document.getElementById("top");
    if (!bannerTop) {
        return null;
    }

    const textContent = bannerTop.textContent;
    if (!textContent) {
        return null;
    }

    const jefeKeyword = "Jefe(a):";
    const startIndex = textContent.indexOf(jefeKeyword);
    if (startIndex === -1) {
        return null;
    }

    const endIndex = textContent.indexOf("\n", startIndex + jefeKeyword.length);
    if (endIndex === -1) {
        return null;
    }

    const jefe = textContent.substring(startIndex + jefeKeyword.length, endIndex).trim();
    return jefe;
}