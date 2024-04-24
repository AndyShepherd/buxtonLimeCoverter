import './style.css'

const csvForm = document.getElementById('csvForm') as HTMLFormElement;
const csvFile = document.getElementById('csvFile') as HTMLInputElement;
const displayArea = document.getElementById('displayArea') as HTMLDivElement;
const table = document.getElementById('result')as HTMLTableElement;
//const csvForm = document.querySelector<HTMLFormElement>('#counter')!;

// is the array to hold the final values from the CSV file
let final_vals = [];
let BACOutput = [];

function padTo2Digits(num: number): string {
    return num.toString().padStart(2, '0');
}

function formatDateToDDMMYY(date: Date): string {
    return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getFullYear() % 100) // Get the last two digits of the year
    ].join('');
}

function convertDate(input: string): string {
    // Parse the input date string
    const date = new Date(input);
  
    // Extract the day, month, and year as strings
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear().toString();
  
    // Concatenate them in the desired format
    return day + month + year;
  }

  function padStringEnd(input: string, maxLength: number): string {
    // Pad the string with spaces on the right side if it's shorter than the maxLength
    if (input.length>maxLength ) {
        return input.substring(0, maxLength)
    } else
    {
        return input.padEnd(maxLength, ' ');
    }
  }
  function padNumberwithZero(input: string, maxLength: number): string {
    // Pad the string with spaces on the right side if it's shorter than the maxLength
    if (input.length>maxLength ) {
        return input.substring(0, maxLength)
    } else
    {
        return input.padStart(maxLength, '0');
    }
  }

  function removeSpecialCharacters(inputString: string): string {
    return inputString.replace(/[,."]/g, "");
  }

// Create an event listener for the form object
csvForm.addEventListener("submit", (e: Event) =>  {
    e.preventDefault(); // prevent HTML form submission

    if (table) {
      // Remove the table element from the DOM
        table.remove();
    }


    let csvReader = new FileReader(); // generate a filereader from the JS API

    const input = csvFile.files[0]; // grab the first (only) file from the input 
    const currentDate = new Date();
    const formattedDate = formatDateToDDMMYY(currentDate);

    // generating the function that will run on the action
    csvReader.onload = function(evt) {
        const text = evt.target.result; // this is the data generated from the csvReader reading the information in the file

        // Ensure the type of information from the file is a string
        if(typeof text === 'string' || text instanceof String) {
            const values = text.split(/[\r\n]+/); // group the information by the CSV breakpoint \n is a new line

            let i =0;
            let freetextval: string;

            values.forEach(val => {
                // further split by each section by the CSV
                if (i!=0 && i!=2) {
                    final_vals.push(val.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
                } else if (i==2){
                    
                    if (val.includes("Month")) //Check the report used and assign the correct FreeText feild value.
                        {
                            freetextval = "M";
                        } else 
                        {
                            freetextval = "WK";
                        }
                }
                i++;
            });

         

            const headerOutput: string[] = [];
            // setup headers For Grid
            headerOutput.push("Dest Sort Code");
            headerOutput.push("Dest A/C No.");
            headerOutput.push("Dest A/C Type");
            headerOutput.push("BACS Code");
            headerOutput.push("Debit Sort Code");
            headerOutput.push("Debit A/C No.");
            headerOutput.push("Free Format");
            headerOutput.push("Amount");
            headerOutput.push("Orig Name");
            headerOutput.push("Pay Ref");
            headerOutput.push("Dest A/C Name");
            headerOutput.push("Proc Date");
            BACOutput.push(headerOutput);

            i=0;

            final_vals.forEach(val => {
                if (val[0] !== "") {
                    if (!val[0].startsWith("TOTAL")) {

                        const rowtemp: string[] = [];

                        const tempstring: string = val[2];

                        rowtemp.push(padStringEnd(tempstring.replace(/-/g, ""),6));  //Dest Sort Code and remove the - from sort code

                        rowtemp.push(padStringEnd(val[3],8));   //Dest A/C No.
                        rowtemp.push(padStringEnd("0",1));  //Dest A/C Type
                        rowtemp.push(padStringEnd("99",2)); //  BACS Code
                        rowtemp.push(padNumberwithZero("202405",6)); // Debit Sort Code
                        rowtemp.push(padNumberwithZero("173479",8)); // Debit A/C No.
                        rowtemp.push(padStringEnd(freetextval + padNumberwithZero(val[8],2),4)); //Free Format - Week number
                        rowtemp.push(padNumberwithZero(removeSpecialCharacters(val[4]),11)); //Amount
                        rowtemp.push(padStringEnd("BUXTON LIMELIMITED",18)); //Orig Name
                        rowtemp.push(padStringEnd("Buxton Lime LtdSal",18)); // Pay Ref
                        rowtemp.push(padStringEnd(val[0] + " " +val[1],18)); //Dest A/C Name
                        rowtemp.push(padStringEnd(convertDate(val[7]),6)); // Proc Date
                        if (i>0){
                           BACOutput.push(rowtemp); 
                        }
                        i++
                }
                }
            });

            //format to save file
           let rows: string[] = [];
           let csvContent:string = "";
            i =0;
            BACOutput.forEach((item) => {

                if (i!=0){
                rows.push(item.join(''));
                }
                i++
            });
           
            csvContent += rows.join('\n');
            
            // trigger a download of the file
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/plain;charset=utf-8,' + encodeURI(csvContent);
            hiddenElement.target = '_blank';
            hiddenElement.download = "BuxtonLime"+ formattedDate + '.txt';
            hiddenElement.click();

            // create form 
            generate_table(<[string[]]>BACOutput)
                    .then(result => {
                    // async function is used to ensure the formatting does not try to occur after the table is created

                    displayArea.innerHTML = result;

                    const th_values = document.getElementsByTagName('th');
                    const td_values = document.getElementsByTagName('td');

                    const capitilize_table_column = (table_el: HTMLElement) => {
                        table_el.innerHTML = table_el.innerHTML[0].toUpperCase() + table_el.innerHTML.slice(1);
                    }

                    for (const th_val of th_values) {
                        capitilize_table_column(th_val);
                    }
                    for (const td_val of td_values) {
                        capitilize_table_column(td_val);
                    }
                });
        }
    }

    // this runs the above action   
    csvReader.readAsText(input);
    csvForm.hidden= true;
    
});


// used as async to ensure a promise can be used to format the data
const generate_table = async (arrayTable: [string[]]) : Promise<string> => {
    return `
        <table id="output" class="table table-striped">
            <thead>
                ${arrayTable[0].map(val => {
                    return `
                        <th scope="col">${val}</th>
                    `
                }).join('')}
            </thead>
            <tbody>
            ${arrayTable.map((val, index) => {
                if(index === 0) return;
                return `
                    <tr>
                        ${val.map(sub_val => {
                            return `
                                <td>${sub_val}</td>
                            `
                        }).join('')}
                    </tr>
                `
            }).join('')}

            </tbody>
        </table>
    `;
}