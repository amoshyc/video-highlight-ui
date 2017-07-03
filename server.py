import argparse
import pathlib
import youtube_dl
from urllib.parse import urlparse
from flask import Flask, request, render_template, send_from_directory

app = Flask(__name__)

video_src = None
video_type = None


@app.route('/')
def index():
    res = render_template(
        'index.html', video_src=video_src, video_type=video_type)

    return res


@app.route('/local/<path:path>', methods=['GET'])
def download_file(path):
    path = pathlib.Path(path)
    directory = str(path.parent)
    filename = str(path.name)
    return send_from_directory(directory=directory, filename=filename)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('path', help="youtube_url or path/to/video")
    args = parser.parse_args()

    global video_src
    global video_type

    if urlparse(args.path).scheme == '':  # arg is path
        path = pathlib.Path(args.path)

        if not path.exists():
            print('Error: "{}" not exists'.format(path))
            print('Program exits.')
            return
        if path.suffix.lower() not in ('.mp4', '.webm', '.ogg'):
            print('Error: "{}" is not supported'.format(path.suffix))
            print('Program exits.')
            return

        video_src = str(path)
        video_type = path.suffix[1:]
    else:  # arg is url
        video_src = args.path
        video_type = 'youtube'

    app.run()


if __name__ == '__main__':
    main()
