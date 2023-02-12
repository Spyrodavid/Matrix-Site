// get context for each input
const input_canvas = document.getElementById("input_canvas");
const input_ctx = input_canvas.getContext("2d");

const output_canvas = document.getElementById("output_canvas");
const output_ctx = output_canvas.getContext("2d");

const matrix_section = document.getElementById("matrix_section");

const validity = document.getElementById("validity");



// // set css size of canvas
// input_canvas.style.width ='100%';
// input_canvas.style.height='100%';

// // then take css size and change canvas size to match
// input_canvas.width  = input_canvas.offsetWidth;
// input_canvas.height = input_canvas.offsetHeight;

// // set css size of canvas
// output_canvas.style.width ='100%';
// output_canvas.style.height='100%';

// // then take css size and change canvas size to match
// output_canvas.width  = output_canvas.offsetWidth;
// output_canvas.height = output_canvas.offsetHeight;


// get dimension of each canvas
out_width = output_canvas.width
out_height = output_canvas.height

in_width = input_canvas.width
in_height = input_canvas.height

input_ctx.translate(in_width / 2 , in_height / 2)
output_ctx.translate(out_width / 2 , out_height / 2)

input_ctx.scale(1 , -1)
output_ctx.scale(1 , -1)


input_points = []
input_points_radius = 5

input_canvas.addEventListener("click", (e) => {
    input_points.push(math.matrix([e.offsetX - in_width / 2, -(e.offsetY - in_height / 2)]))
});

var programStart = Date.now()

var t1 = Date.now()
var t2 = Date.now()


function MainLoop() {

    

    input_ctx.fillStyle = "white";
    input_ctx.fillRect(-in_width / 2, -in_height / 2, in_width, in_height)

    output_ctx.fillStyle = "white";
    output_ctx.fillRect(-out_width / 2, -out_height / 2, out_width, out_height)

    // draw grid lines on Input
    input_ctx.beginPath();
    input_ctx.moveTo(0, in_height / 2);
    input_ctx.lineTo(0, -in_height / 2);

    input_ctx.moveTo(in_width / 2, 0);
    input_ctx.lineTo(-in_width / 2, 0);
    input_ctx.stroke();


    // draw grid lines on Output
    output_ctx.beginPath();
    output_ctx.moveTo(0, in_height / 2);
    output_ctx.lineTo(0, -in_height / 2);

    output_ctx.moveTo(in_width / 2, 0);
    output_ctx.lineTo(-in_width / 2, 0);
    output_ctx.stroke();


    matrices_to_multiply = []

    matrix_nodes = matrix_section.children
    for (let i = 0; i < matrix_nodes.length; i++) {
        const matrix_settings_node = matrix_nodes[i];
        var matrix_node = matrix_settings_node.children[0]

        if (matrix_node.tagName != "DIV") {
            break
        }

        var matrix_inputs = matrix_node.children

        

        is_numbers_flag = true
        for (const matrix_input of matrix_inputs) { 
            if (isNaN(Number(matrix_input.value))) {
                is_numbers_flag = false
                break
            }
        }
        

        if (is_numbers_flag) {
            new_matrix = math.matrix([[matrix_inputs[0].value, matrix_inputs[1].value],
            [matrix_inputs[2].value, matrix_inputs[3].value]])
            matrices_to_multiply.push(new_matrix)
            validity.innerHTML = "All Matrices Valid!"
            validity.style.color = "black"
        } else {
            validity.innerHTML = "Invalid Value in a Matrix!"
            validity.style.color = "red"
        }

       
        
    }

    // input draw
    for (let index = 0; index < input_points.length; index++) {
        const current_point = input_points[index];
        
        // draw point
        input_ctx.strokeStyle = `black`
        input_ctx.beginPath();
        input_ctx.arc(current_point.get([0]), current_point.get([1]), input_points_radius, 0, 2 * Math.PI);
        input_ctx.stroke();
    }

    // output draw
    for (let point_index = 0; point_index < input_points.length; point_index++) {
        var current_point = input_points[point_index];

        // go through each matrix
        for (let matrix_index = 0; matrix_index < matrices_to_multiply.length; matrix_index++) {
            const current_matrix = matrices_to_multiply[matrix_index];

            current_point = math.multiply(current_point, current_matrix)
        }
       
        
        // draw point
        output_ctx.strokeStyle = `black`
        output_ctx.beginPath();
        output_ctx.arc(current_point.get([0]), current_point.get([1]), input_points_radius, 0, 2 * Math.PI);
        output_ctx.stroke();
    }
    
    

    requestAnimationFrame(MainLoop)

}
requestAnimationFrame(MainLoop)


function newMatrix() {
    matrix = document.createElement("div")
    var matrix_and_settings = document.createElement("div")
    matrix_and_settings.id = "matrix_and_settings"
    matrix_and_settings.appendChild(matrix)
    matrix.id = "matrix"
    matrix.classList.add("grid")

    matrix_section.appendChild(matrix_and_settings)

    matrix_columns = 2
    matrix_rows = 2
    for (let i = 1; i <= matrix_columns; i++) {
        for (let j = 1; j <= matrix_rows; j++) {
            matrix_input = document.createElement("input")

            

            if (i == j) {
                matrix_input.defaultValue = "1"
            }
            else {
                matrix_input.defaultValue = "0"
            }

            matrix_input.style.gridRow = i
            matrix_input.style.gridColumn = j
            
            matrix.appendChild(matrix_input)
        }
    }

    matrix_delete_button = document.createElement("button")
    matrix_delete_button.innerHTML = "❌"
    matrix_delete_button.id = "matrix_delete_button"
    matrix_delete_button.addEventListener("click", () => {matrix_and_settings.remove()})
    matrix_and_settings.appendChild(matrix_delete_button)

            
}

function clearPoints() {
    input_points = []
}