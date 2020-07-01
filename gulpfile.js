const Q = require("q");
const del = require("del");
const gulp = require("gulp");
const util = require("gulp-template-util");
const gcPub = require("gulp-gcloud-publish");

const bucketNameForTest = "tutor-test-events";
const bucketNameForProd = "tutor-events";
const projectId = "tutor-204108";
const projectIdTest = "tutor-test-238709";
const keyFileName = "tutor.json";
const keyFileNameTest = "tutor-test.json";
const projectName = "event/elsep109/";

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

let uploadGCSProd = bucketName => {
    return gulp
        .src(["dist/*.html", "dist/img/**", "dist/css/**"], {
            base: `${__dirname}/dist/`
        })
        .pipe(
            gcPub({
                bucket: bucketName,
                keyFilename: keyFileName,
                base: projectName,
                projectId: projectId,
                public: true,
                metadata: {
                    cacheControl: "no-store, no-transform"
                }
            })
        );
};

let uploadGCSTest = bucketName => {
    return gulp
        .src(["dist/*.html", "dist/img/**", "dist/css/**"], {
            base: `${__dirname}/dist/`
        })
        .pipe(
            gcPub({
                bucket: bucketName,
                keyFilename: keyFileNameTest,
                base: projectName,
                projectId: projectIdTest,
                public: true,
                metadata: {
                    cacheControl: "no-store, no-transform"
                }
            })
        );
};

gulp.task("package", () => {
    let deferred = Q.defer();
    Q.fcall(() => {
        return util.logPromise(cleanTask);
    }).then(() => {
        return Q.all([util.logStream(copyStaticTask("dist"))]);
    });
    return deferred.promise;
});

gulp.task("uploadGcsTest", uploadGCSTest.bind(uploadGCSTest, bucketNameForTest));
gulp.task("uploadGcsProd", uploadGCSProd.bind(uploadGCSProd, bucketNameForProd));
