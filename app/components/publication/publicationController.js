myApp.controller('publicationController',['$scope', '$http', '$location','$cookies','$cookieStore','URL', 'Upload', '$sce', function ($scope, $http, $location, $cookies, $cookieStore,URL, Upload, $sce) {

$scope.sessionString = $cookies.get('sessionString');
$scope.username = $cookies.get('username');

$scope.uploadPublication = function($file){
  $scope.file = $file;

}
$scope.allowEdit = false;
var url = $location.path().split('/');
if(url.length ==3){
  var publicationID = url[2];
  $http({
    url: URL + "/getPublicationByID",
    method: "POST",
    data:{
      "publicationID": publicationID,
    }
  }).then(function success(response){
    if(response.status == 200){
        if(response.data.status == "true" && response.data.msg!=undefined){
          var pubInfo = response.data.msg.publicationInfo;
          if(pubInfo!=undefined){

            $scope.pubName = pubInfo.name;
            $scope.pubIssn = pubInfo.ISSN;
            $scope.abstract = pubInfo.paperAbstract;
            $scope.journalName = pubInfo.publishedAt;
            $scope.pubDate = pubInfo.publishDate;
            $scope.publicationPath = $sce.trustAsResourceUrl(pubInfo.filePath);
          }
          var userInfo = response.data.msg.userInfo;

          for(var i=0;i<userInfo.length;i++){
            if($scope.sessionString == userInfo[i].sessionString){
              $scope.allowEdit = false;
              break;
            }
          }
        }
    }
  },
function error(response){
  console.log(response.statusText);
}

);
}
else{
  $scope.allowEdit = true;
}

$scope.savePublication = function(){
/**
 * check if all the required values are provided
 */
var name = $scope.pubName;
var issn = $scope.pubIssn;
var abstract = $scope.abstract;
var journalName = $scope.journalName;
var pubDate = $scope.pubDate.toString();
var otherUsersStr = $scope.otherUsers;
var otherUsers = [];
if(otherUsersStr!=undefined && otherUsersStr.trim()!=""){
  var splittedArr = otherUsersStr.split(',');
  for(var i = 0; i<splittedArr.length;i++){
    if(splittedArr[i]!=undefined && splittedArr[i].trim()!="")
      otherUsers.push(splittedArr[i]);
  }
}
Upload.upload({
  url: 'http://silo.soic.indiana.edu:54545/uploadPaperPdf',
  file: $scope.file,
  data:
  {
    'username': $scope.username,
    'sessionString': $scope.sessionString,
    'name': name,
    'paperAbstract':abstract,
    'publishedAt': journalName,
    'publishDate': pubDate,
    'ISSN': issn,
    'otherUsernames': otherUsers
 },
}).progress(function(e){console.log("progress: " + e)}).then(function(data, status, headers, config){
  $location.path("/profile/"+$scope.username)
});

}


}]);
