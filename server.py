import argparse
import pathlib
import json
import sys
from urllib.parse import urlparse

import tornado.ioloop
import tornado.web
from tornado.escape import json_decode, json_encode

video_src = None
video_type = None


class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html', video_src=video_src, video_type=video_type)


class InfoHandler(tornado.web.RequestHandler):
    def post(self):
        info = {'video_src': video_src, 'video_type': video_type}
        self.write(json_encode(info))


# arg = json_decode(self.request.body)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('path', help="path/to/video or youtube_url")
    args = parser.parse_args()

    global video_src
    global video_type

    route = [
        (r'/', IndexHandler),
        (r'/info', InfoHandler),
        (r'/static/(.*)', tornado.web.StaticFileHandler, { 'path': './static' }),
    ] # yapf: disable

    if urlparse(args.path).scheme in ['http', 'https']:
        video_src = args.path
        video_type = 'youtube'
    else:
        path = pathlib.Path(args.path).expanduser().absolute()
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
            route.append((r'/local/@(.*)', tornado.web.StaticFileHandler, {
                'path': str(path.parent)
            }))

    app = tornado.web.Application(route)

    app.listen(8787)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()