const questionEl = document.getElementById('question');
const instructionsEl = document.getElementById('instructions');
const questionArea = document.getElementById('questionArea');
const notesEl = document.getElementById('notes');
const copyBtn = document.getElementById('copyBtn');

let step = 0;
let finalNotes = [];

function startFlow() {
  notesEl.value = '';
  finalNotes = [];

  const fields = [
    '• Caller Name and Position: ' + document.getElementById('callerName').value,
    '• Site Name: ' + document.getElementById('siteName').value,
    '• Caller Phone #: ' + document.getElementById('callerPhone').value,
    '• Issue Reported: ' + document.getElementById('issueReported').value,
    '• Invenco Model: ' + document.getElementById('invencoModel').value,
    '• POS Type: ' + document.getElementById('posType').value,
    '• When/How did this issue begin?: ' + document.getElementById('issueStart').value,
    '• Any customer Troubleshooting before call?: ' + document.getElementById('custTrouble').value,
    '• Existing Case Related?: ' + document.getElementById('caseRelated').value,
    '• KB Article Referenced: ' + document.getElementById('kbArticle').value,
    '• Troubleshooting Performed On Call So Far:'
  ];

  fields.forEach(line => addNote(line));

  showStep(0);
  questionArea.style.display = 'block';
  document.getElementById('buttons').style.display = 'block';
}

function showStep(stepNum) {
  const steps = {
    0: {
      question: "Does the OPT in question have power?",
      instructions: "Check visually if the OPT screen is on, lights are active, and the unit is receiving power."
    },
    1: {
      question: "Is the error on the screen showing OOS (Out of Service)?",
      instructions: "Check if the screen explicitly shows Out of Service or a related code."
    },
    2: {
      question: "Do we have any stuck sales?",
      instructions: "Ask if any transactions are stuck, preventing use of the OPT."
    },
    3: {
      question: "Does the site know how to clear stuck sales?",
      instructions: "If unsure, advise contacting Verifone support (VFI)."
    },
    4: {
      question: "Are they able to set prepays?",
      instructions: "Have the caller attempt to set a prepay on-site."
    },
    5: {
      question: "Check status on ICS. Is it operational?",
      instructions: "Check ICS online status, last contact, and operational flag for the dispenser."
    },
    6: {
      question: "Did the OPT recover?",
      instructions: "Confirm if the OPT has returned to normal operation after the intervention."
    },
    7: {
      question: "Is the pump visible in the EMV Initialization POP list?",
      instructions: "Check EMV initialization visibility via KB 1377 on ICS."
    },
    8: {
      question: "Did the pump recover?",
      instructions: "Check pump readiness after DCR driver and initialization. If not, repeat process."
    },
    10: {
      question: "Did the OPT update on ICS (last contact updated or shows operational)?",
      instructions: "Verify if the OPT updated after LAN cable reseating."
    }
  };

  if (steps[stepNum]) {
    questionEl.innerText = steps[stepNum].question;
    instructionsEl.innerText = steps[stepNum].instructions;
    step = stepNum;
  } else {
    questionEl.innerText = "Troubleshooting Complete";
    instructionsEl.innerText = "";
  }
}

function handleAnswer(answer) {
  switch (step) {
    case 0:
      if (answer === 'Yes') {
        showStep(1);
      } else {
        addNote('OPT does not have power. Confirm power to dispenser (check both sides, reset breaker if needed).');
        finish();
      }
      break;
    case 1:
      if (answer === 'Yes') {
        showStep(2);
      } else {
        addNote('Screen is not showing OOS. Document error message and follow correct path.');
        finish();
      }
      break;
    case 2:
      if (answer === 'Yes') {
        showStep(3);
      } else {
        showStep(4);
      }
      break;
    case 3:
      if (answer === 'Yes') {
        addNote('Site knows how to clear stuck sales.');
        showStep(4);
      } else {
        addNote('Site unsure how to clear stuck sales. Referred to VFI. Ticket closed and number provided.');
        finish();
      }
      break;
    case 4:
      if (answer === 'Yes') {
        showStep(5);
      } else {
        addNote('Customer unable to set prepays. Referred to VFI (Verifone). Ticket closed and number provided.');
        finish();
      }
      break;
    case 5:
      if (answer === 'Yes') {
        addNote('ICS operational. Sent reboot from ICS, waiting 2-3 minutes.');
        showStep(6);
      } else {
        addNote('ICS not operational. Reseated LAN cable at OPT and dispenser link.');
        showStep(10);
      }
      break;
    case 6:
      if (answer === 'Yes') {
        addNote('OPT recovered. Ticket closed and number provided.');
        finish();
      } else {
        showStep(7);
      }
      break;
    case 7:
      if (answer === 'Yes') {
        addNote('Pump visible in EMV POP list. Followed KB 1377 for EMV initialization (30-45 min). Ticket provided.');
        finish();
      } else {
        addNote('Pump not visible in EMV POP list. Performed DCR driver, reboot OPT from ICS, then DCR initialization.');
        showStep(8);
      }
      break;
    case 8:
      if (answer === 'Yes') {
        addNote('Pump recovered. Ticket closed and number provided.');
        finish();
      } else {
        addNote('Pump did not recover. Repeating DCR driver, reboot OPT from ICS, then DCR initialization.');
        showStep(8);
      }
      break;
    case 10:
      if (answer === 'Yes') {
        addNote('OPT updated on ICS after LAN reseat. Sent reboot from ICS, waiting 2-3 minutes.');
        showStep(6);
      } else {
        addNote('OPT did not update on ICS after LAN reseat.');
        finish();
      }
      break;
    default:
      finish();
  }
}

function addNote(text) {
  finalNotes.push(text);
}

function finish() {
  questionEl.innerText = "Troubleshooting Complete";
  instructionsEl.innerText = "";
  document.getElementById('buttons').style.display = 'none';
  copyBtn.style.display = 'block';

  const callInfo = finalNotes.slice(0, 11).join('\n');
  const stepsTaken = finalNotes.slice(11);

  let notesText = `${callInfo}\n\n---\nFinal Summary of Steps Taken:\n`;
  notesText += stepsTaken.map((note, idx) => `${idx + 1}. ${note}`).join('\n');

  notesEl.value = notesText;
  finalNotes = [];
}

function copyNotes() {
  notesEl.select();
  document.execCommand('copy');
  alert('Notes copied to clipboard!');
}
