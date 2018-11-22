var words = [];
var states = [[]];
var globalState = 0;
var globalMachine = [];

// Add a primary dictionary to start
var primaryWords = ['include', 'define', 'using', 'namespace', 'main', 'string', 'unsigned'];
primaryWords.forEach(word => {
    words.push(word);
    $('#dict').append(`<span class="tag is-primary is-word word-${word}">${word}<button class="delete is-small remove-word" onclick="removeWord('${word}')"></button></span>`);
    updateMachine();
})
updateMachine();

$(document).ready(function() {
    // Show the dictionary
    $(".dict").click(function(){
        $('.modal').addClass('is-active');
    });

    // Close the dictionary
    $(".close-modal").click(function(){
        $('.modal').removeClass("is-active");
    });

    // Add word into the dict
    $(".add-word").click(function(){
        var word = ($('.new-word').val()).toLowerCase(); 
        addWord(word);
    });

    // Verify if the word is reconigzed by the machine
    $('.verify-word').keyup(() => {
		if (globalMachine.length > 0){
			verifyWord($('.verify-word').val());
		}
    });
})

function addWord(word) {
    // Verify if the field was not empty and if the word is not in the dict
    if (word && jQuery.inArray(word, words) == -1) {
        // Verify if are only acceptable chars
        var regex =  /([^A-Za-z_])/;
        // If is a valid word, add it to the dict and to the machine
        if (!regex.test(word)) {
            words.push(word);
            $('#dict').append(`<span class="tag is-primary is-word word-${word}">${word}<button class="delete is-small remove-word" onclick="removeWord('${word}')"></button></span>`);

            updateMachine();
            iziToast.show({
                message: `Word '${word}' added to the dict!`,
                color: 'green',
                position: 'topCenter'
            });
        } else {
            iziToast.show({
                message: `Only alphabetical characters are allowed.`,
                color: 'red',
                position: 'topCenter'
            });
        }
    } else {
        iziToast.show({
            message: `Word '${word}' already exists in the dict!`,
            color: 'red',
            position: 'topCenter'
        });
    }
    
    $('.new-word').val('')
}

// Remove word from the dict and update machine to do not reconigze it
function removeWord(word) {
    words.splice($.inArray(word, words), 1);
    states = [[]];
    globalMachine = [[]];
    globalState = 0;
    $(".word-" + word).remove();
    updateMachine();
    $('.verify-word').val('');
    $('.verify-word').removeClass('valid');
    $('.verify-word').removeClass('invalid');

    iziToast.show({
        message: `Word '${word}' removed from the dict!`,
        color: 'green',
        position: 'topCenter'
    });
}

// Function to create/update the states machine
function updateMachine() {
    var next = 0;

    words.forEach(word => {
        var curr = 0;
        // Look for all letters in the word
        for (i = 0; i<word.length; i++) {
            // If the current state in the position of the actual letter is not defined, define
            if (typeof states[curr][word[i]] === 'undefined') {
                // Set the state that this actual position will point
                next = globalState + 1;
                states[curr][word[i]] = next;
                // Set the new state in the array/machine
                states[next] = [];
                // Change the current state to the next
                globalState = curr = next;
            } else {
                // This state for the actual letter was defined before, so change the current state to verify
                curr = states[curr][word[i]];
            }
            // If we are in the final letter of the word, set this current state as final
            if (i == (word.length -1)) {
                states[curr]['final'] = true;
            }
        }
    });

    $('#machine').html('');
    var machine = [];
    // For each state we will iterate to build the table machine
    for (i = 0; i < states.length; i++) {
        var aux = [];
        var row = '';
        // The columns are the letters A to Z
        for(j = 'a'.charCodeAt(0); j <= 'z'.charCodeAt(0); j++) {
            var letter = String.fromCharCode(j);
            // If the actual state-letter is not defined, do not set the next state, set state otherwise
            if (typeof states[i][letter] == 'undefined') {
               row = row + `<td class="column-${letter} state-"><img src="img/favicon.png"/ ></td>`;
               aux[letter] = '-';
            } else {
                row = row + `<td class="column-${letter}">q${states[i][letter]}</td>`;
                aux[letter] = states[i][letter];
            }
        }

        // Check if the state is not a final state
        if (typeof states[i]['final'] !== 'undefined') {
            row = `<td class="states">q${i}*</td>` + row;
            aux['final'] = true;
        } else {
            row = `<td class="states">q${i}</td>` + row;
        }
        
        $('#machine').append(`<tr class="row-${i}">${row}</tr>`);

        machine.push(aux);
    }

    globalMachine = machine;
}

function verifyWord(word){
    var state = 0;
    var err = false;
    for (var i = 0; i < word.length; i++) {
        $('#machine tr').removeClass('focus-row');
        $('#machine td').removeClass('focus-col');
        $('#machine tr').removeClass('focus-row-err');
        $('#machine td').removeClass('focus-col-err');

        if (word[i] >= 'a' && word[i] <= 'z'){
            if (globalMachine[state][word[i]] != '-' && !err){
                $('#machine .row-' + state).addClass('focus-row');
                $('#machine .column-' + word[i]).addClass('focus-col');
                $('.verify-word').addClass('valid');
                $('.verify-word').removeClass('invalid');
                state = globalMachine[state][word[i]];
            } else {
                $('.verify-word').removeClass('valid');
                $('.verify-word').addClass('invalid');
                $('#machine .row-' + state).addClass('focus-row-err');
                $('#machine .column-' + word[i]).addClass('focus-col-err');
                err = true;
                state++;
            }
        } else if (word[i] == ' ' && word.length > 1) {
            if (globalMachine[state]['final']){
                $('#machine .row-' + state).addClass('focus-row');
                $('.verify-word').addClass('valid');
                $('.verify-word').removeClass('invalid');

                if (err) {
                    $('.words').append(`<span class="tag is-danger">${word}</span>`);
                    iziToast.show({
                        title: 'Not Found!',
                        message: 'Lexus could not recognize the word.',
                        color: 'red',
                        position: 'topCenter'
                    });
                } else {
                    $('.words').append(`<span class="tag is-primary">${word}</span>`);
                    iziToast.show({
                        title: 'Found!',
                        message: 'Lexus recognized the word!',
                        color: 'green',
                        position: 'topCenter'
                    });
                }
            } else {
                $('.words').append(`<span class="tag is-danger">${word}</span>`);
                iziToast.show({
                    title: 'Not Found!',
                    message: 'Lexus could not recognize the word.',
                    color: 'red',
                    position: 'topCenter'
                });
            }
            $('.verify-word').val('');
                $('.verify-word').removeClass('valid');
                $('.verify-word').removeClass('invalid');
                state = 0;
        }
    }

    if (word.length == 0) {
        $('#machine tr').removeClass('focus-row');
        $('#machine td').removeClass('focus-col');
        $('#machine tr').removeClass('focus-row-err');
        $('#machine td').removeClass('focus-col-err');
        $('.verify-word').removeClass('valid');
        $('.verify-word').removeClass('invalid');
    }
}