const Q = require("q");
const del = require("del");
const gulp = require("gulp");
const util = require("gulp-template-util");
const gcPub = require("gulp-gcloud-publish");

let bucketNameForTest = "tutor-events-test";
let bucketNameForProd = "tutor-events";
let projectId = "tutor-204108";
let keyFilename = "tutor.json";
let projectName = "event/elsep108/";

let copyStaticTask = dest => {
    return () => {
        return gulp
            .src(["src/*.html", "src/img/**", "src/css/**"], {
                base: "src"
            })
            .pipe(gulp.dest(dest));
    };
};

let cleanTask = () => {
    return del(["dist", ""]);
};

let uploadGCS = bucketName => {
    return gulp
        .src(["./dist/*.html", "./dist/css/**", "./dist/img/**/*.@(jpg|png|gif|svg)"], {
            base: `${__dirname}/dist/`
        })
        .pipe(
            gcPub({
                bucket: bucketName,
                keyFilename: keyFilename,
                base: projectName,
                projectId: projectId,
                public: true,
                metadata: {
                    cacheControl: "no-store"
                }
            })
        );
};

gulp.task("uploadGcpTest", uploadGCS.bind(uploadGCS, bucketNameForTest));
gulp.task("uploadGcpProd", uploadGCS.bind(uploadGCS, bucketNameForProd));
gulp.task("build", ["style", "lib"]);
gulp.task("package", () => {
    let deferred = Q.defer();
    Q.fcall(() => {
        return util.logPromise(cleanTask);
    }).then(() => {
        return Q.all([util.logStream(copyStaticTask("dist"))]);
    });
    return deferred.promise;
});
