
//for addressing rows and columns dynamically.
for (let i = 1; i <= 100; i++) {
    let str = "";
    let n = i;

    while (n > 0) {
        let rem = n % 26;
        if (rem == 0) {
            //then continue naming like AA,AB..so on.
            str = "Z" + str;
            n = Math.floor(n / 26) - 1;
        } else {
            //for naming from A to Z.
            str = String.fromCharCode((rem - 1) + 65) + str;
            n = Math.floor(n / 26);
        }
    }
    $("#columns").append(`<div class="column-name">${str}</div>`)
    $("#rows").append(`<div class="row-name">${i}</div>`)
}

//this cellData will store data only about the cells whose content or any of default property is changed.
//->cell data is an object with first key as sheet1 which is an array
let cellData = {
    "Sheet1": {}
};

let save = true;

let selectedSheet = "Sheet1";
let totalSheets = 1;
let lastlyAddedSheet = 1;


//all the default values of a paricular cell properties.
let defaultProperties = {
    "font-family": "Noto Sans",
    "font-size": 14,
    "text": "",
    "bold": false,
    "italic": false,
    "underlined": false,
    "alignment": "left",
    "color": "#444",
    "bgcolor": "#fff"
};
//creating rows , columns and appending it in the container.
for (let i = 1; i <= 100; i++) {
    let row = $('<div class="cell-row"></div>');
    for (let j = 1; j <= 100; j++) {
        row.append(`<div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`);
    }
    $("#cells").append(row);
}
//function for scrolling the rows and columns
$("#cells").scroll(function (e) {
    $("#columns").scrollLeft(this.scrollLeft);
    $("#rows").scrollTop(this.scrollTop);
});
//when we dbl click on particular cell then following fn will work(i.e. add selected class to it.)
$(".input-cell").dblclick(function (e) {
    //remove selected class from previously selected cell and mark the current cell selected.
    $(".input-cell.selected").removeClass("selected top-selected bottom-selected left-selected right-selected");
    $(this).addClass("selected");
    $(this).attr("contenteditable", "true");
    $(this).focus();
});
//if we remove focus from current cell then remove property of selected cell
$(".input-cell").blur(function (e) {
    $(this).attr("contenteditable", "false");
    updateCellData("text", $(this).text());
});

//function for getting row idx and col idx used for displaying the current address  of cell in formula bar
function getRowCol(ele) {
    let id = $(ele).attr("id");
    let idArray = id.split("-");
    let rowId = parseInt(idArray[1]);
    let colId = parseInt(idArray[3]);
    return [rowId, colId];
}

function getTopLeftBottomRightCell(rowId, colId) {
    let topCell = $(`#row-${rowId - 1}-col-${colId}`);
    let bottomCell = $(`#row-${rowId + 1}-col-${colId}`);
    let leftCell = $(`#row-${rowId}-col-${colId - 1}`);
    let rightCell = $(`#row-${rowId}-col-${colId + 1}`);
    return [topCell, bottomCell, leftCell, rightCell];
}
// for a given selected cell do the following thing.
$(".input-cell").click(function (e) {
    let [rowId, colId] = getRowCol(this);
    let [topCell, bottomCell, leftCell, rightCell] = getTopLeftBottomRightCell(rowId, colId);
    //this will work in case we are selecting multiple cells at a one time.
    if ($(this).hasClass("selected") && e.ctrlKey) {
        unselectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    } else {
        selectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    }
});
//--->>> de select currently selected cell (i.e. remove all the properties that a de-selected box should contain)
function unselectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if ($(ele).attr("contenteditable") == "false") {
        if ($(ele).hasClass("top-selected")) {
            topCell.removeClass("bottom-selected");
        }

        if ($(ele).hasClass("bottom-selected")) {
            bottomCell.removeClass("top-selected");
        }

        if ($(ele).hasClass("left-selected")) {
            leftCell.removeClass("right-selected");
        }

        if ($(ele).hasClass("right-selected")) {
            rightCell.removeClass("left-selected");
        }

        $(ele).removeClass("selected top-selected bottom-selected left-selected right-selected");
    }

}
//->>if the cell is selected then mark it selected in the properties
function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if (e.ctrlKey) {

        // top selected or not
        let topSelected;
        if (topCell) {
            topSelected = topCell.hasClass("selected");
        }

        // bottom selected or not
        let bottomSelected;
        if (bottomCell) {
            bottomSelected = bottomCell.hasClass("selected");
        }


        // left selected or not
        let leftSelected;
        if (leftCell) {
            leftSelected = leftCell.hasClass("selected");
        }

        // right selected or not
        let rightSelected;
        if (rightCell) {
            rightSelected = rightCell.hasClass("selected");
        }

        if (topSelected) {
            $(ele).addClass("top-selected");
            topCell.addClass("bottom-selected");
        }

        if (bottomSelected) {
            $(ele).addClass("bottom-selected");
            bottomCell.addClass("top-selected");
        }

        if (leftSelected) {
            $(ele).addClass("left-selected");
            leftCell.addClass("right-selected");
        }

        if (rightSelected) {
            $(ele).addClass("right-selected");
            rightCell.addClass("left-selected");
        }
        //->>if not selected then remove all properties from current cell.
    } else {
        $(".input-cell.selected").removeClass("selected top-selected bottom-selected left-selected right-selected");


    }
    $(ele).addClass("selected");
    changeHeader(getRowCol(ele));
}

//this function is for changing the data of header(i.e properties selescted of a current cell) if we are jumping from one cell to another then property of current cell must be visible in header.
function changeHeader([rowId, colId]) {
    let data;
    if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
        data = cellData[selectedSheet][rowId - 1][colId - 1];
    } else {
        data = defaultProperties;
    }
    $(".alignment.selected").removeClass("selected");
    $(`.alignment[data-type=${data.alignment}]`).addClass("selected");
    addRemoveSelectFromFontStyle(data, "bold");
    addRemoveSelectFromFontStyle(data, "italic");
    addRemoveSelectFromFontStyle(data, "underlined");
    //
    $("#fill-color").css("border-bottom", `4px solid ${data.bgcolor}`);
    $("#text-color").css("border-bottom", `4px solid ${data.color}`);
    $("#font-family").val(data["font-family"]);
    $("#font-size").val(data["font-size"]);
    $("#font-family").css("font-family", data["font-family"]);
}
//function used in changeheader function for displaying current selected cell property 
function addRemoveSelectFromFontStyle(data, property) {
    if (data[property]) {
        $(`#${property}`).addClass("selected");
    } else {
        $(`#${property}`).removeClass("selected");
    }
}

let count = 0;
let startcellSelected = false;
let startCell = {};
let endCell = {};
let scrollXRStarted = false;
let scrollXLStarted = false;
$(".input-cell").mousemove(function (e) {
    e.preventDefault();
    if (e.buttons == 1) {
        if (e.pageX > ($(window).width() - 10) && !scrollXRStarted) {
            scrollXR();
        } else if (e.pageX < (10) && !scrollXLStarted) {
            scrollXL();
        }
        if (!startcellSelected) {
            let [rowId, colId] = getRowCol(this);
            startCell = { "rowId": rowId, "colId": colId };
            selectAllBetweenCells(startCell, startCell);
            startcellSelected = true;
            $(".input-cell.selected").attr("contenteditable", "false");
        }
    } else {
        startcellSelected = false;
    }
});

$(".input-cell").mouseenter(function (e) {
    if (e.buttons == 1) {
        if (e.pageX < ($(window).width() - 10) && scrollXRStarted) {
            clearInterval(scrollXRInterval);
            scrollXRStarted = false;
        }

        if (e.pageX > 10 && scrollXLStarted) {
            clearInterval(scrollXLInterval);
            scrollXLStarted = false;
        }
        let [rowId, colId] = getRowCol(this);
        endCell = { "rowId": rowId, "colId": colId };
        selectAllBetweenCells(startCell, endCell);
    }
})

function selectAllBetweenCells(start, end) {
    $(".input-cell.selected").removeClass("selected top-selected bottom-selected left-selected right-selected");
    for (let i = Math.min(start.rowId, end.rowId); i <= Math.max(start.rowId, end.rowId); i++) {
        for (let j = Math.min(start.colId, end.colId); j <= Math.max(start.colId, end.colId); j++) {
            let [topCell, bottomCell, leftCell, rightCell] = getTopLeftBottomRightCell(i, j);
            selectCell($(`#row-${i}-col-${j}`)[0], { "ctrlKey": true }, topCell, bottomCell, leftCell, rightCell);
        }
    }
}

// let scrollXRInterval;
// let scrollXLInterval;
// function scrollXR() {
//     scrollXRStarted = true;
//     scrollXRInterval = setInterval(() => {
//         $("#cells").scrollLeft($("#cells").scrollLeft() + 100);
//     }, 100);
// }


// function scrollXL() {
//     scrollXLStarted = true;
//     scrollXLInterval = setInterval(() => {
//         $("#cells").scrollLeft($("#cells").scrollLeft() - 100);
//     }, 100);
// }

$(".data-container").mousemove(function (e) {
    e.preventDefault();
    if (e.buttons == 1) {
        if (e.pageX > ($(window).width() - 10) && !scrollXRStarted) {
            scrollXR();
        } else if (e.pageX < (10) && !scrollXLStarted) {
            scrollXL();
        }
    }
});

// $(".data-container").mouseup(function (e) {
//     clearInterval(scrollXRInterval);
//     clearInterval(scrollXLInterval);
//     scrollXRStarted = false;
//     scrollXLStarted = false;
// });

$(".alignment").click(function (e) {
    let alignment = $(this).attr("data-type");
    $(".alignment.selected").removeClass("selected");
    $(this).addClass("selected");
    $(".input-cell.selected").css("text-align", alignment);
    //calling update icon in 
    updateCellData("alignment", alignment);
});

$("#bold").click(function (e) {
    setStyle(this, "bold", "font-weight", "bold");
});

$("#italic").click(function (e) {
    setStyle(this, "italic", "font-style", "italic");
});

$("#underlined").click(function (e) {
    setStyle(this, "underlined", "text-decoration", "underline");
});

function setStyle(ele, property, key, value) {
    if ($(ele).hasClass("selected")) {
        $(ele).removeClass("selected");
        $(".input-cell.selected").css(key, "");
        // $(".input-cell.selected").each(function (index, data) {
        //     let [rowId, colId] = getRowCol(data);
        //     cellData[rowId - 1][colId - 1][property] = false;
        // });
        updateCellData(property, false);
    } else {
        $(ele).addClass("selected");
        $(".input-cell.selected").css(key, value);
        // $(".input-cell.selected").each(function (index, data) {
        //     let [rowId, colId] = getRowCol(data);
        //     cellData[rowId - 1][colId - 1][property] = true;
        // });
        updateCellData(property, true);
    }
}


$(".pick-color").colorPick({
    'initialColor': "#abcd",
    'allowRecent': true,
    'recentMax': 5,
    'allowCustomColor': true,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function () {
        if (this.color != "#ABCD") {
            if ($(this.element.children()[1]).attr("id") == "fill-color") {
                $(".input-cell.selected").css("background-color", this.color);
                $("#fill-color").css("border-bottom", `4px solid ${this.color}`);
                // $(".input-cell.selected").each((index, data) => {
                //     let [rowId, colId] = getRowCol(data);
                //     cellData[rowId - 1][colId - 1].bgcolor = this.color;
                // });
                updateCellData("bgcolor", this.color)
            }
            if ($(this.element.children()[1]).attr("id") == "text-color") {
                $(".input-cell.selected").css("color", this.color);
                $("#text-color").css("border-bottom", `4px solid ${this.color}`);
                // $(".input-cell.selected").each((index, data) => {
                //     let [rowId, colId] = getRowCol(data);
                //     cellData[rowId - 1][colId - 1].color = this.color;
                // });
                updateCellData("color", this.color);
            }
        }
    }
});

// color filler in the current cell on click
$("#fill-color").click(function (e) {
    setTimeout(() => {
        $(this).parent().click();
    }, 10);
});
// color filler in the cell
$("#text-color").click(function (e) {
    setTimeout(() => {
        $(this).parent().click();
    }, 10);
});
//font family updater in our sheet object(or in database)
$(".menu-selector").change(function (e) {
    let value = $(this).val();
    let key = $(this).attr("id");
    if (key == "font-family") {
        $("#font-family").css(key, value);
    }
    if (!isNaN(value)) {
        value = parseInt(value);
    }

    $(".input-cell.selected").css(key, value);
    // $(".input-cell.selected").each((index, data) => {
    //     let [rowId, colId] = getRowCol(data);
    //     cellData[rowId - 1][colId - 1][key] = value;
    // })
    updateCellData(key, value);
});

function updateCellData(property, value) {
    let currCellData = JSON.stringify(cellData);
    if (value != defaultProperties[property]) {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCol(data);
            //this if is for checking if row exist or not if not then create the row and initialise it with default properties 
            //first and then update it with the value.
            if (cellData[selectedSheet][rowId - 1] == undefined) {
                cellData[selectedSheet][rowId - 1] = {};
                cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties };
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
            } else {
                if (cellData[selectedSheet][rowId - 1][colId - 1] == undefined) {
                    cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties };
                    cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                } else {
                    //if row exist and column also exist then we just need to update values.
                    cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                }
            }

        });
    } else {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCol(data);
            if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                if (JSON.stringify(cellData[selectedSheet][rowId - 1][colId - 1]) == JSON.stringify(defaultProperties)) {
                    //if current cell data  is same as default properties then delete the current cell
                    delete cellData[selectedSheet][rowId - 1][colId - 1];
                    //now after checking if the other cells exist or not in the row if not then simply delete the current row.
                    if (Object.keys(cellData[selectedSheet][rowId - 1]).length == 0) {
                        delete cellData[selectedSheet][rowId - 1];
                    }
                }
            }
        });
    }
    if (save && currCellData != JSON.stringify(cellData)) {
        save = false;
    }
}
$(".container").click(function (e) {
    $(".sheet-options-modal").remove();
});
function addSheetEvents() {
    //context menu used for displaying rename and delete option when we roght click on sheet tab.
    $(".sheet-tab.selected").on("contextmenu", function (e) {
        e.preventDefault();
        selectSheet(this);
        $(".sheet-options-modal").remove();
        let modal = $(`<div class="sheet-options-modal">
                        <div class="option sheet-rename">Rename</div>
                        <div class="option sheet-delete">Delete</div>
                    </div>`);
        modal.css({ "left": e.pageX });
        $(".container").append(modal);
        $(".sheet-rename").click(function (e) {
            let renameModal = $(`<div class="sheet-modal-parent">
                                    <div class="sheet-rename-modal">
                                        <div class="sheet-modal-title">Rename Sheet</div>
                                        <div class="sheet-modal-input-container">
                                            <span class="sheet-modal-input-title">Rename Sheet to:</span>
                                            <input class="sheet-modal-input" type="text" />
                                        </div>
                                        <div class="sheet-modal-confirmation">
                                            <div class="button yes-button">OK</div>
                                            <div class="button no-button">Cancel</div>
                                        </div>
                                    </div>
                                </div>`);

            $(".container").append(renameModal);
            $(".sheet-modal-input").focus();
            $(".no-button").click(function (e) {
                $(".sheet-modal-parent").remove();
            });
            $(".yes-button").click(function (e) {
                renameSheet();
            });
            $(".sheet-modal-input").keypress(function (e) {
                if (e.key == "Enter") {
                    renameSheet();
                }
            })
        });

        $(".sheet-delete").click(function (e) {
            if (totalSheets > 1) {
                let deleteModal = $(`<div class="sheet-modal-parent">
                                    <div class="sheet-delete-modal">
                                        <div class="sheet-modal-title">${selectedSheet}</div>
                                        <div class="sheet-modal-detail-container">
                                            <span class="sheet-modal-detail-title">Are you sure?</span>
                                        </div>
                                        <div class="sheet-modal-confirmation">
                                            <div class="button yes-button">
                                                <div class="material-icons delete-icon">delete</div>
                                                Delete
                                            </div>
                                            <div class="button no-button">Cancel</div>
                                        </div>
                                    </div>
                                </div>`);

                $(".container").append(deleteModal);
                $(".no-button").click(function (e) {
                    $(".sheet-modal-parent").remove();
                });
                $(".yes-button").click(function (e) {
                    deleteSheet();
                });
            } else {
                alert("Not possible");
            }
        })
    });

    $(".sheet-tab.selected").click(function (e) {
        selectSheet(this);
    });
}

addSheetEvents();

$(".add-sheet").click(function (e) {
    save = false;
    lastlyAddedSheet++;
    totalSheets++;
    cellData[`Sheet${lastlyAddedSheet}`] = {};
    $(".sheet-tab.selected").removeClass("selected");
    $(".sheet-tab-container").append(`<div class="sheet-tab selected">Sheet${lastlyAddedSheet}</div>`);
    selectSheet();
    addSheetEvents();
    $(".sheet-tab.selected")[0].scrollIntoView();
});
//function useful in hovering affect over a current sheet
function selectSheet(ele) {
    if (ele && !$(ele).hasClass("selected")) {
        $(".sheet-tab.selected").removeClass("selected");
        $(ele).addClass("selected");
    }
    emptyPreviousSheet();
    selectedSheet = $(".sheet-tab.selected").text();
    loadCurrentSheet();
    $("#row-1-col-1").click();
}
//empty the sheet for the new sheet to be added
function emptyPreviousSheet() {
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[rowId]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);
            cell.text("");
            cell.css({
                "font-family": "NotoSans",
                "font-size": 14,
                "background-color": "#fff",
                "color": "#444",
                "font-weight": "",
                "font-style": "",
                "text-decoration": "",
                "text-align": "left"
            });
        }
    }
}

//if a sheet is previously emptied , then the load function will load the previously entered data into the sheet again.
function loadCurrentSheet() {
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[rowId]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);
            cell.text(data[rowId][colId].text);
            cell.css({
                "font-family": data[rowId][colId]["font-family"],
                "font-size": data[rowId][colId]["font-size"],
                "background-color": data[rowId][colId]["bgcolor"],
                "color": data[rowId][colId].color,
                "font-weight": data[rowId][colId].bold ? "bold" : "",
                "font-style": data[rowId][colId].italic ? "italic" : "",
                "text-decoration": data[rowId][colId].underlined ? "underline" : "",
                "text-align": data[rowId][colId].alignment
            });
        }
    }
}
//sheet rename modal that will display on screen while rename option is active 
function renameSheet() {
    let newSheetName = $(".sheet-modal-input").val();
    if (newSheetName && !Object.keys(cellData).includes(newSheetName)) {
        save = false;
        let newCellData = {};
        for (let i of Object.keys(cellData)) {
            if (i == selectedSheet) {
                newCellData[newSheetName] = cellData[selectedSheet];
            } else {
                newCellData[i] = cellData[i];
            }
        }

        cellData = newCellData;

        selectedSheet = newSheetName;
        $(".sheet-tab.selected").text(newSheetName);
        $(".sheet-modal-parent").remove();
    } else {
        $(".rename-error").remove();
        $(".sheet-modal-input-container").append(`
            <div class="rename-error"> Sheet Name is not valid or Sheet already exists! </div>
        `)
    }
}
//delete sheet 
//this will ensure that if we are deleting a particular sheet then automatically either the previous or next sheet will be a selected sheet now
function deleteSheet() {
    $(".sheet-modal-parent").remove();
    let sheetIndex = Object.keys(cellData).indexOf(selectedSheet);
    let currSelectedSheet = $(".sheet-tab.selected");
    if (sheetIndex == 0) {
        selectSheet(currSelectedSheet.next()[0]);
    } else {
        selectSheet(currSelectedSheet.prev()[0]);
    }
    delete cellData[currSelectedSheet.text()];
    currSelectedSheet.remove();
    totalSheets--;
}

$(".left-scroller,.right-scroller").click(function (e) {
    let keysArray = Object.keys(cellData);
    let selectedSheetIndex = keysArray.indexOf(selectedSheet);
    if (selectedSheetIndex != 0 && $(this).text() == "arrow_left") {
        selectSheet($(".sheet-tab.selected").prev()[0]);
    } else if (selectedSheetIndex != (keysArray.length - 1) && $(this).text() == "arrow_right") {
        selectSheet($(".sheet-tab.selected").next()[0]);
    }

    $(".sheet-tab.selected")[0].scrollIntoView();
});



$("#menu-file").click(function (e) {
    let fileModal = $(`<div class="file-modal">
                        <div class="file-options-modal">
                            <div class="close">
                                <div class="material-icons close-icon">arrow_circle_down</div>
                                <div>Close</div>
                            </div>
                            <div class="new">
                                <div class="material-icons new-icon">insert_drive_file</div>
                                <div>New</div>
                            </div>
                            <div class="open">
                                <div class="material-icons open-icon">folder_open</div>
                                <div>Open</div>
                            </div>
                            <div class="save">
                                <div class="material-icons save-icon">save</div>
                                <div>Save</div>
                            </div>
                        </div>
                        <div class="file-recent-modal"></div>
                        <div class="file-transparent"></div>
                    </div>`);
    $(".container").append(fileModal);
    fileModal.animate({
        width: "100vw"
    }, 300);
    $(".close,.file-transparent,.new,.save,.open").click(function (e) {
        fileModal.animate({
            width: "0vw"
        }, 300);
        setTimeout(() => {
            fileModal.remove();
        }, 250);
    });
    // rename option function i.e displaying a rename modal.
    $(".new").click(function (e) {
        if (save) {
            newFile();
        } else {
            $(".container").append(`<div class="sheet-modal-parent">
                                        <div class="sheet-delete-modal">
                                            <div class="sheet-modal-title">${$(".title").text()}</div>
                                            <div class="sheet-modal-detail-container">
                                                <span class="sheet-modal-detail-title">Do you want to save changes?</span>
                                            </div>
                                            <div class="sheet-modal-confirmation">
                                                <div class="button yes-button">
                                                    Yes
                                                </div>
                                                <div class="button no-button">No</div>
                                            </div>
                                        </div>
                                    </div>`);
            //if no button option is clicked then remove current sheet
            $(".no-button").click(function (e) {
                $(".sheet-modal-parent").remove();
                newFile();
            });
            //if yes is selected 
            $(".yes-button").click(function (e) {
                // save function
                $(".sheet-modal-parent").remove();
                saveFile(true);
            });
        }
    });

    $(".save").click(function (e) {
        saveFile();
    });

    $(".open").click(function (e) {

        openFile();

    })


});





function newFile() {
    emptyPreviousSheet();
    cellData = { "Sheet1": {} };
    $(".sheet-tab").remove();
    $(".sheet-tab-container").append(`<div class="sheet-tab selected">Sheet1</div>`);
    addSheetEvents();
    selectedSheet = "Sheet1";
    totalSheets = 1;
    lastlyAddedSheet = 1;
    $(".title").text("Unititled");
    $("#row-1-col-1").click();
}

function saveFile(newclicked) {
    $(".container").append(`<div class="sheet-modal-parent">
                                <div class="sheet-rename-modal">
                                    <div class="sheet-modal-title">Save File</div>
                                    <div class="sheet-modal-input-container">
                                        <span class="sheet-modal-input-title">File Name:</span>
                                        <input class="sheet-modal-input" value="${$(".title").text()}" type="text" />
                                    </div>
                                    <div class="sheet-modal-confirmation">
                                        <div class="button yes-button">Save</div>
                                        <div class="button no-button">Cancel</div>
                                    </div>
                                </div>
                            </div>`);
    $(".yes-button").click(function (e) {
        $(".title").text($(".sheet-modal-input").val());
        let a = document.createElement("a");
        a.href = `data:application/json,${encodeURIComponent(JSON.stringify(cellData))}`;
        a.download = $(".title").text() + ".json";
        $(".container").append(a);
        a.click();
        a.remove();
        save = true;
    });
    $(".no-button,.yes-button").click(function (e) {
        $(".sheet-modal-parent").remove();

        if (newclicked) {
            newFile();
        }
    });
}



function openFile() {
    let inputFile = $(`<input accept="application/json" type="file" />`);
    $(".container").append(inputFile);
    inputFile.click();
    inputFile.change(function (e) {
        // console.log(inputFile.val());
        let file = e.target.files[0];
        $(".title").text(file.name.split(".json")[0]);
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            emptyPreviousSheet();
            $(".sheet-tab").remove();
            cellData = JSON.parse(reader.result);
            let sheets = Object.keys(cellData);
            lastlyAddedSheet = 1;
            for (let i of sheets) {
                if (i.includes("Sheet")) {
                    let splittedSheetArray = i.split("Sheet");
                    if (splittedSheetArray.length == 2 && !isNaN(splittedSheetArray[1])) {
                        lastlyAddedSheet = parseInt(splittedSheetArray[1]);
                    }
                }
                $(".sheet-tab-container").append(`<div class="sheet-tab selected">${i}</div>`);
            }
            addSheetEvents();
            $(".sheet-tab").removeClass("selected");
            $($(".sheet-tab")[0]).addClass("selected");
            selectedSheet = sheets[0];
            totalSheets = sheets.length;
            loadCurrentSheet();
            inputFile.remove();
        }
    });
}


let clipboard = { startCell: [], cellData: {} };
let contentCutted = false;

$("#copy,#cut").click(function (e) {

    if ($(this).text() == "content_cut") {
        contentCutted = true;
    }

    let [rowId, colId] = getRowCol($(".input-cell.selected")[0]);
    clipboard.startCell = [rowId, colId];

    // changes in cell = traverse

    $(".input-cell.selected").each(function (index, data) {

        let [rowId, colId] = getRowCol(data);

        if (cellData[selectedSheet][rowId - 1] && (cellData[selectedSheet][rowId - 1][colId - 1])) {

            if (!clipboard.cellData[rowId]) {
                clipboard.cellData[rowId] = {};

            }

            clipboard.cellData[rowId][colId] = { ...cellData[selectedSheet][rowId - 1][colId - 1] };


        }

    });

    // console.log(cellData);

})

$("#paste").click(function (e) {
    if (contentCutted) {
        emptyPreviousSheet();
    }
    let startCell = getRowCol($(".input-cell.selected")[0]);
    let rows = Object.keys(clipboard.cellData);
    for (let i of rows) {
        let cols = Object.keys(clipboard.cellData[i]);
        for (let j of cols) {
            if (contentCutted) {

                delete cellData[selectedSheet][i - 1][j - 1]; //delete col

                if (Object.keys(cellData[selectedSheet][i - 1]).length == 0) {  //deleting row
                    delete cellData[selectedSheet][i - 1];
                }
            }

        }
    }

    for (let i of rows) { //[paste]
        let cols = Object.keys(clipboard.cellData[i]);
        for (let j of cols) {

            let rowDistance = parseInt(i) - parseInt(clipboard.startCell[0]);
            let colDistance = parseInt(j) - parseInt(clipboard.startCell[1]);
            //if row exist and then check if column exist then collect data from 
            //previous cells and copy it to new one
            //if row doesnt exist then create the row first
            if (!cellData[selectedSheet][startCell[0] + rowDistance - 1]) {
                cellData[selectedSheet][startCell[0] + rowDistance - 1] = {};
            }
            cellData[selectedSheet][startCell[0] + rowDistance - 1][startCell[1] + colDistance - 1] = { ...clipboard.cellData[i][j] };
        }
    }
    if (contentCutted) {
        contentCutted = false;
        clipboard = { startCell: [], cellData: {} };
    }
    loadCurrentSheet();
})


// let selectedCells = [];


// $("#copy").click(function () {
//     $(".input-cell.selected").each(function () {
//         let [rowId, colId] = getRowCol(this);
//         console.log(rowId, colId);
//         selectedCells.push(getRowCol(this));
//     });
//     console.log(cellData);
// })

// $("#paste").click(function () {
//     console.log(cellData);
//     let [rowId, colId] = getRowCol($(".input-cell.selected")[0]);
//     let rowDistance = rowId - selectedCells[0][0];
//     let colDistance = colId - selectedCells[0][1];

//     for (let cell of selectedCells) {
//         let newRowId = cell[0] + rowDistance;
//         let newColId = cell[1] + colDistance;

//         if (!cellData[selectedSheet][newRowId]) {
//             cellData[selectedSheet][newRowId] = {};
//         }
//         cellData[selectedSheet][newRowId][newColId] = { ...cellData[selectedSheet][cell[0]][cell[1]] };
//     }
//     console.log(cellData);
//     loadCurrentSheet();
// })