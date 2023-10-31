#set($body=$input.json("$"))
#set($inputRoot = $input.path("$"))
$input.json("$")
#if($inputRoot.toString().contains("statusCode"))
#set($context.responseOverride.status = $util.parseJson($body).get("statusCode"))
#end