let categories = [];
document.getElementById("start-button").addEventListener("click", setupAndStart);

//Returns array of category ids


async function getCategoryIds() {
    const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/categories?count=5`);

    return response.data.map((val) => val.id)
}

//Return object with data about a category
async function getCategory(catId) {
    const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);

    const title = response.data.title;
    const clues = response.data.clues.map((val) => ({
        question: val.question,
        answer: val.answer,
        showing: null 
    }))

    return {title, clues}
}

//Fill the HTML table#jeopardy with the categories & cells for questions
async function fillTable() {

    //select element
    const table = document.getElementById("jeopardy");
    //create elements
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody"); 

    //clear table
    thead.innerHTML = "";
    tbody.innerHTML = "";

    //create table head for categories 
    const headRow = document.createElement("tr");

    for (let category of categories)
    {
        const th = document.createElement("th")
        th.innerText = category.title;
        headRow.appendChild(th);
    }
    thead.appendChild(headRow);

    //loop to create each row 
    for (let i = 0; i < 5; i++)
    {
        //create row 
        const row = document.createElement("tr");

        //loop to create each cell
        for (let j = 0; j < 5; j++)
        {
            const cell = document.createElement("td");
            //show ? initially
            cell.innerText = "?";

            cell.dataset.cat = j; //column number 
            cell.dataset.clue = i; //row number

            cell.dataset.cat = j; //which category
            cell.dataset.clue = i; //which clue 

            //click listener
            cell.addEventListener("click", handleClick);

            row.appendChild(cell);
        }
        tbody.appendChild(row);
    }

}

//Handle clicking on a clue: show the question or answer.
function handleClick(evt) {
    let catIdx = evt.target.dataset.cat;
    let clueIdx = evt.target.dataset.clue;
    let clue = categories[catIdx].clues[clueIdx];

    //already answered
    if (clue.showing === "answer") return;

    //not showing anything, show question 
    if (clue.showing === null)
    {
        evt.target.innerHTML = clue.question;
        clue.showing = "question"; //display question
        evt.target.classList.add("question-shown");
    }

    //if question is showing, show answer
    else if (clue.showing === "question")
    {
        evt.target.innerHTML = clue.answer;
        clue.showing = "answer";
        evt.target.classList.remove("question-shown");
        evt.target.classList.add("answer-shown");
    }

}

//wipe the current Jeopardy board, show loading 
function showLoadingView() {
    document.getElementById("loading").style.display = "block"; // show loading
    document.getElementById("jeopardy").style.display = "none"; // hide table
}

//Remove the loading spinner and update the button used to fetch data
function hideLoadingView() {
    document.getElementById("loading").style.display = "none"; // hide loading
    document.getElementById("jeopardy").style.display = "table"; // show table
}

//Start game
async function setupAndStart() {
    showLoadingView();

    //clear out array
    categories = [];
    
    //get 5 random category ids 
    const catIds = await getCategoryIds();

    const catPromises = catIds.map(id => getCategory(id));
    //wait for categories 
    categories = await Promise.all(catPromises);

    fillTable();

    hideLoadingView();
}