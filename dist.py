#!/usr/bin/env python3


import os
import shutil
import shlex
import subprocess
import tempfile
import zipfile
import requests


closure_compiler_url = "https://dl.google.com/closure-compiler/compiler-latest.zip"


def setup():
    r = requests.get(closure_compiler_url, allow_redirects=True)
    with tempfile.NamedTemporaryFile(suffix=".zip", mode="wb") as tf:
        tf.write(r.content)
        ref = zipfile.ZipFile(tf.name, "r")
        tmpdir = tempfile.mkdtemp()
        ref.extractall(tmpdir)
    compiler_filename = None
    for name in os.listdir(path=tmpdir):
        if "closure-compiler" in name:
            compiler_filename = os.path.join(tmpdir, name)

    dist = "dist"
    try:
        os.mkdir(dist)
    except Exception:
        pass
    for name in os.listdir(path="src"):
        source = os.path.join("src", name)
        if os.path.isdir(source) and name != "node_modules":
            shutil.copytree(source, os.path.join(dist, name))
        elif os.path.isfile(source):
            filename, ext = os.path.splitext(name)
            if ext == ".js":
                cmd = "java -jar {jarfile} --js {name} \
                    --js_output_file {dest}".format(
                    jarfile=compiler_filename,
                    name=source,
                    dest=os.path.join(dist, name)
                )
                print(shlex.split(cmd))
                p = subprocess.Popen(shlex.split(cmd))
                out, err = p.communicate()
                if err:
                    print(err)
                else:
                    print(out)
            else:
                shutil.copy(source, dist)

    os.chdir(dist)
    p = subprocess.Popen(["yarn", "install"])
    out, err = p.communicate()
    if err:
        print(err)
    else:
        print(out)
    shutil.rmtree(tmpdir)
    print('Done!')


if __name__ == "__main__":
    setup()
