(function() {

  var socket = io('/');

  // TODO(sgreco): figure out socket.io stuff

  var generate_score_div = function(score, id) {
  	return $('<div class="score">')
  		.append($('<div class="upvote-arrow"><a href="#"><i class="fa fa-chevron-up"></i></a></div'))
  		.append($('<div>').addClass(score > 0 ? "score-positive" 
  									: score == 0 ? "score-neutral"
  									: "score-negative" ).text(score))
  		.append($('<div class="downvote-arrow"><a href="#"><i class="fa fa-chevron-down"></i></a></div>'));

  }

  var generate_content_div = function(content) {
  	return $('<div class="sentence-content">')
  		.append($('<div class="sentence-text">').text(content));
  }

  $('#new-sentence-submit').click(function() {
  	socket.emit('new_sentence', $('#new-sentence-text').val());
  	$('#new-sentence-text').empty();
  });

  socket.on('sentence', function(val) {
  	console.log(val);
  	$($('<div class="sentence">')
  		.append(generate_score_div(val.score))
  		.append(generate_content_div(val.content)))
  	.insertBefore('#new-sentence-divider');
  });

})();
