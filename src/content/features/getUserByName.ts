export async function getUserByName(
    dialogVisador: HTMLDivElement, 
    userName: string, 
    executionNumber: number = 0, 
    cancelable: boolean = false): Promise<boolean> {
    const table = dialogVisador.querySelectorAll("table")[1] as HTMLTableElement;
    if (executionNumber > 10) { return false; }
    const userList = Array.from(table.querySelector("tbody")?.querySelectorAll("tr") ?? [])
    if (!userList || userList.length == 0) { return false; }
    if (userList[0].textContent?.trim() == 'No se encontraron registros.') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return await getUserByName(dialogVisador, userName, executionNumber + 1);
    }

    const userFiltered = userList.filter(x => x.textContent?.toUpperCase().includes(userName.toUpperCase()))[0];
    if (userFiltered) {
        userFiltered.children[1].getElementsByTagName("input")[0].click();
        return true;
    } else if (!cancelable) {
        const navigator = table.parentElement?.parentElement?.getElementsByTagName("a");
        if (!navigator || navigator.length <= 2) { return false; }
        navigator[2].click();
        await new Promise(resolve => setTimeout(resolve, 200));
        const result = await getUserByName(dialogVisador, userName, executionNumber + 1, true);
        if (result) {
            navigator[0].click();
            return true;
        } else {
            return false;
        }
    }

    return false;
}